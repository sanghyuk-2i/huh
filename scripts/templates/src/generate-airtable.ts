import {
  HEADERS,
  SAMPLE_KO,
  SAMPLE_EN,
  TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
  type SampleRow,
} from './data.js';

const AIRTABLE_API = 'https://api.airtable.com/v0';

function getToken(): string | null {
  return process.env.AIRTABLE_TOKEN ?? null;
}

async function airtableFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<unknown> {
  const res = await fetch(`${AIRTABLE_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable API error ${res.status}: ${body}`);
  }

  return res.json();
}

interface AirtableFieldConfig {
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

function buildFields(): AirtableFieldConfig[] {
  const fieldMap: Record<string, AirtableFieldConfig> = {
    trackId: { name: 'trackId', type: 'singleLineText' },
    type: {
      name: 'type',
      type: 'singleSelect',
      options: {
        choices: TYPE_OPTIONS.map((name) => ({ name })),
      },
    },
    message: { name: 'message', type: 'multilineText' },
    title: { name: 'title', type: 'singleLineText' },
    image: { name: 'image', type: 'url' },
    actionLabel: { name: 'actionLabel', type: 'singleLineText' },
    actionType: {
      name: 'actionType',
      type: 'singleSelect',
      options: {
        choices: ACTION_TYPE_OPTIONS.map((name) => ({ name })),
      },
    },
    actionTarget: { name: 'actionTarget', type: 'url' },
  };

  return HEADERS.map((h) => fieldMap[h]);
}

function rowToRecord(row: SampleRow): { fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  for (const h of HEADERS) {
    const value = row[h];
    if (value) fields[h] = value;
  }
  return { fields };
}

async function createOrUpdateTable(
  token: string,
  baseId: string,
  tableName: string,
  samples: SampleRow[],
): Promise<void> {
  // Try to add records to existing table
  const records = samples.map(rowToRecord);

  // Batch insert (max 10 per request)
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await airtableFetch(`/${baseId}/${encodeURIComponent(tableName)}`, token, {
      method: 'POST',
      body: JSON.stringify({ records: batch }),
    });
  }
}

export interface AirtableResult {
  baseId: string;
  baseUrl: string;
}

export async function generateAirtable(): Promise<AirtableResult | null> {
  const token = getToken();
  if (!token) return null;

  const existingBaseId = process.env.AIRTABLE_BASE_ID;

  if (existingBaseId) {
    // Read existing table schema via Meta API
    const metaRes = (await airtableFetch(
      `/meta/bases/${existingBaseId}/tables`,
      token,
    )) as { tables: { id: string; name: string; fields: { name: string; type: string }[] }[] };

    const expectedFields = buildFields();

    const tables = [
      { name: '한국어', samples: SAMPLE_KO },
      { name: 'English', samples: SAMPLE_EN },
    ];

    for (const table of tables) {
      const tableMeta = metaRes.tables.find((t) => t.name === table.name);
      if (!tableMeta) {
        throw new Error(
          `Table "${table.name}" not found in base ${existingBaseId}. ` +
          `Please create tables named "한국어" and "English" in the Airtable base.`,
        );
      }

      // Create missing fields
      const existingFieldNames = new Set(tableMeta.fields.map((f) => f.name));
      for (const field of expectedFields) {
        if (!existingFieldNames.has(field.name)) {
          await airtableFetch(
            `/meta/bases/${existingBaseId}/tables/${tableMeta.id}/fields`,
            token,
            { method: 'POST', body: JSON.stringify(field) },
          );
        }
      }

      // Delete existing records
      const listRes = (await airtableFetch(
        `/${existingBaseId}/${encodeURIComponent(table.name)}`,
        token,
      )) as { records: { id: string }[] };

      if (listRes.records.length > 0) {
        for (let i = 0; i < listRes.records.length; i += 10) {
          const batch = listRes.records.slice(i, i + 10);
          const params = batch.map((r) => `records[]=${r.id}`).join('&');
          await airtableFetch(
            `/${existingBaseId}/${encodeURIComponent(table.name)}?${params}`,
            token,
            { method: 'DELETE' },
          );
        }
      }

      // Re-populate
      await createOrUpdateTable(token, existingBaseId, table.name, table.samples);
    }

    return {
      baseId: existingBaseId,
      baseUrl: `https://airtable.com/${existingBaseId}`,
    };
  }

  // Create new base
  const fields = buildFields();

  const createRes = (await airtableFetch('/meta/bases', token, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Huh Error Template',
      tables: [
        {
          name: '한국어',
          fields,
        },
        {
          name: 'English',
          fields,
        },
      ],
    }),
  })) as { id: string };

  const baseId = createRes.id;

  // Add sample records
  await createOrUpdateTable(token, baseId, '한국어', SAMPLE_KO);
  await createOrUpdateTable(token, baseId, 'English', SAMPLE_EN);

  return {
    baseId,
    baseUrl: `https://airtable.com/${baseId}`,
  };
}
