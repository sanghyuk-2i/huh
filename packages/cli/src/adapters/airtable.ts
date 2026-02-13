import type { AirtableSource } from '../commands/init';
import { registerAdapter } from './registry';
import type { SourceAdapter } from './types';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

const EXPECTED_FIELDS = [
  'trackId',
  'type',
  'message',
  'title',
  'image',
  'severity',
  'actionLabel',
  'actionType',
  'actionTarget',
];

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export async function fetchAirtableData(source: AirtableSource): Promise<string[][]> {
  const token = source.token ?? process.env.AIRTABLE_TOKEN;
  if (!token) {
    throw new Error(
      'Airtable token is required. Set AIRTABLE_TOKEN env variable or provide token in config.',
    );
  }

  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${AIRTABLE_API_BASE}/${source.baseId}/${source.tableId}`);
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AirtableResponse;
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  if (allRecords.length === 0) {
    throw new Error('No records found in Airtable table');
  }

  return airtableRecordsToRows(allRecords);
}

export function airtableRecordsToRows(records: AirtableRecord[]): string[][] {
  const headerRow = [...EXPECTED_FIELDS];
  const dataRows = records.map((record) =>
    EXPECTED_FIELDS.map((field) => {
      const value = record.fields[field];
      if (value == null) return '';
      return String(value);
    }),
  );

  return [headerRow, ...dataRows];
}

const airtableAdapter: SourceAdapter<AirtableSource> = {
  type: 'airtable',
  fetch: fetchAirtableData,
};

registerAdapter(airtableAdapter);
