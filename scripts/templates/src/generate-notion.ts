import {
  HEADERS,
  SAMPLE_KO,
  SAMPLE_EN,
  TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
  type SampleRow,
} from './data.js';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

function getToken(): string | null {
  return process.env.NOTION_TOKEN ?? null;
}

async function notionFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<unknown> {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion API error ${res.status}: ${body}`);
  }

  return res.json();
}

interface NotionPropertySchema {
  [key: string]: Record<string, unknown>;
}

// Notion reserves "title" as a property type name, so we rename
// the "title" field to "errorTitle" to avoid conflicts.
const NOTION_FIELD_MAP: Partial<Record<string, string>> = {
  title: 'errorTitle',
};

function notionFieldName(header: string): string {
  return NOTION_FIELD_MAP[header] ?? header;
}

function buildProperties(): NotionPropertySchema {
  return {
    trackId: { title: {} },
    type: {
      select: {
        options: TYPE_OPTIONS.map((name) => ({ name })),
      },
    },
    message: { rich_text: {} },
    errorTitle: { rich_text: {} },
    image: { url: {} },
    severity: {
      select: {
        options: SEVERITY_OPTIONS.map((name) => ({ name })),
      },
    },
    actionLabel: { rich_text: {} },
    actionType: {
      select: {
        options: ACTION_TYPE_OPTIONS.map((name) => ({ name })),
      },
    },
    actionTarget: { url: {} },
  };
}

function rowToPageProperties(row: SampleRow): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const h of HEADERS) {
    const value = row[h];
    const fieldName = notionFieldName(h);

    if (h === 'trackId') {
      props[fieldName] = { title: [{ text: { content: value } }] };
    } else if (h === 'type' || h === 'actionType' || h === 'severity') {
      if (value) {
        props[fieldName] = { select: { name: value } };
      }
    } else if (h === 'image' || h === 'actionTarget') {
      if (value) {
        props[fieldName] = { url: value };
      }
    } else {
      // rich_text fields: message, title, actionLabel
      props[fieldName] = { rich_text: [{ text: { content: value } }] };
    }
  }

  return props;
}

async function findDatabaseByTitle(
  token: string,
  parentPageId: string,
  title: string,
): Promise<string | null> {
  let startCursor: string | undefined;

   
  while (true) {
    const params = startCursor ? `?start_cursor=${startCursor}` : '';
    const res = (await notionFetch(`/blocks/${parentPageId}/children${params}`, token)) as {
      results: { id: string; type: string; child_database?: { title: string } }[];
      has_more: boolean;
      next_cursor: string | null;
    };

    for (const block of res.results) {
      if (block.type === 'child_database' && block.child_database?.title === title) {
        return block.id;
      }
    }

    if (!res.has_more) break;
    startCursor = res.next_cursor ?? undefined;
  }

  return null;
}

async function ensureDatabaseProperties(token: string, databaseId: string): Promise<void> {
  // Fetch current database schema
  const db = (await notionFetch(`/databases/${databaseId}`, token)) as {
    properties: Record<string, { id: string; type: string }>;
  };

  const existingProps = new Set(Object.keys(db.properties));
  const expectedProps = buildProperties();

  // Collect missing properties
  const missingProps: NotionPropertySchema = {};
  for (const [name, config] of Object.entries(expectedProps)) {
    if (!existingProps.has(name)) {
      missingProps[name] = config;
    }
  }

  if (Object.keys(missingProps).length === 0) return;

  // Update database schema with missing properties
  await notionFetch(`/databases/${databaseId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ properties: missingProps }),
  });
}

async function findOrCreateDatabase(
  token: string,
  parentPageId: string,
  dbTitle: string,
): Promise<string> {
  const existingId = await findDatabaseByTitle(token, parentPageId, dbTitle);
  if (existingId) {
    await ensureDatabaseProperties(token, existingId);
    await clearDatabase(token, existingId);
    return existingId;
  }
  return createDatabase(token, parentPageId, dbTitle);
}

async function createDatabase(
  token: string,
  parentPageId: string,
  dbTitle: string,
): Promise<string> {
  const res = (await notionFetch('/databases', token, {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ text: { content: dbTitle } }],
      properties: buildProperties(),
    }),
  })) as { id: string };

  return res.id;
}

async function addPages(token: string, databaseId: string, samples: SampleRow[]): Promise<void> {
  for (const row of samples) {
    await notionFetch('/pages', token, {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: rowToPageProperties(row),
      }),
    });
  }
}

async function clearDatabase(token: string, databaseId: string): Promise<void> {
  // Query all pages in the database
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const res = (await notionFetch(`/databases/${databaseId}/query`, token, {
      method: 'POST',
      body: JSON.stringify({
        start_cursor: startCursor,
        page_size: 100,
      }),
    })) as { results: { id: string }[]; has_more: boolean; next_cursor: string | null };

    // Archive (delete) each page
    for (const page of res.results) {
      await notionFetch(`/pages/${page.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ archived: true }),
      });
    }

    hasMore = res.has_more;
    startCursor = res.next_cursor ?? undefined;
  }
}

export interface NotionResult {
  koDatabaseId: string;
  enDatabaseId: string;
  koDatabaseUrl: string;
  enDatabaseUrl: string;
}

export async function generateNotion(): Promise<NotionResult | null> {
  const token = getToken();
  if (!token) return null;

  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  const existingDbId = process.env.NOTION_DATABASE_ID;

  if (existingDbId) {
    // Update existing database: ensure schema, clear, and re-populate
    await ensureDatabaseProperties(token, existingDbId);
    await clearDatabase(token, existingDbId);
    await addPages(token, existingDbId, SAMPLE_KO);

    return {
      koDatabaseId: existingDbId,
      enDatabaseId: existingDbId,
      koDatabaseUrl: `https://notion.so/${existingDbId.replace(/-/g, '')}`,
      enDatabaseUrl: `https://notion.so/${existingDbId.replace(/-/g, '')}`,
    };
  }

  if (!parentPageId) {
    console.warn('  NOTION_PARENT_PAGE_ID is required to create new databases. Skipping.');
    return null;
  }

  // Find existing or create new databases
  const koDbId = await findOrCreateDatabase(token, parentPageId, 'Huh Error Template (한국어)');
  await addPages(token, koDbId, SAMPLE_KO);

  const enDbId = await findOrCreateDatabase(token, parentPageId, 'Huh Error Template (English)');
  await addPages(token, enDbId, SAMPLE_EN);

  const result: NotionResult = {
    koDatabaseId: koDbId,
    enDatabaseId: enDbId,
    koDatabaseUrl: `https://notion.so/${koDbId.replace(/-/g, '')}`,
    enDatabaseUrl: `https://notion.so/${enDbId.replace(/-/g, '')}`,
  };

  console.warn('\n  Note: Notion databases must be shared publicly via the Notion UI.');
  console.warn(
    '  Open each database URL and use Share > "Publish to web" to make them accessible.',
  );

  return result;
}
