import type { NotionSource } from '../commands/init';
import { registerAdapter } from './registry';
import type { SourceAdapter } from './types';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const EXPECTED_FIELDS = [
  'trackId',
  'type',
  'message',
  'title',
  'image',
  'actionLabel',
  'actionType',
  'actionTarget',
];

interface NotionRichText {
  plain_text: string;
}

interface NotionProperty {
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name: string } | null;
  url?: string | null;
  number?: number | null;
  email?: string | null;
  phone_number?: string | null;
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export async function fetchNotionData(source: NotionSource): Promise<string[][]> {
  const token = source.token ?? process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      'Notion token is required. Set NOTION_TOKEN env variable or provide token in config.',
    );
  }

  const allPages: NotionPage[] = [];
  let nextCursor: string | null = null;

  do {
    const body: Record<string, unknown> = {};
    if (nextCursor) {
      body.start_cursor = nextCursor;
    }

    const response = await fetch(`${NOTION_API_BASE}/databases/${source.databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as NotionQueryResponse;
    allPages.push(...data.results);
    nextCursor = data.has_more ? data.next_cursor : null;
  } while (nextCursor);

  if (allPages.length === 0) {
    throw new Error('No pages found in Notion database');
  }

  return notionPagesToRows(allPages);
}

export function extractPropertyValue(property: NotionProperty): string {
  switch (property.type) {
    case 'title':
      return (property.title ?? []).map((t) => t.plain_text).join('');
    case 'rich_text':
      return (property.rich_text ?? []).map((t) => t.plain_text).join('');
    case 'select':
      return property.select?.name ?? '';
    case 'url':
      return property.url ?? '';
    case 'number':
      return property.number != null ? String(property.number) : '';
    case 'email':
      return property.email ?? '';
    case 'phone_number':
      return property.phone_number ?? '';
    default:
      return '';
  }
}

export function notionPagesToRows(pages: NotionPage[]): string[][] {
  const headerRow = [...EXPECTED_FIELDS];
  const dataRows = pages.map((page) =>
    EXPECTED_FIELDS.map((field) => {
      const property = page.properties[field];
      if (!property) return '';
      return extractPropertyValue(property);
    }),
  );

  return [headerRow, ...dataRows];
}

const notionAdapter: SourceAdapter<NotionSource> = {
  type: 'notion',
  fetch: fetchNotionData,
};

registerAdapter(notionAdapter);
