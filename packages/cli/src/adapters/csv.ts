import * as fs from 'fs';
import * as path from 'path';
import type { CsvSource } from '../commands/init';
import { registerAdapter } from './registry';
import type { SourceAdapter } from './types';

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\r') {
        if (i + 1 < text.length && text[i + 1] === '\n') {
          i++;
        }
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Handle last field/row (no trailing newline)
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export async function fetchCsvData(source: CsvSource): Promise<string[][]> {
  const filePath = path.resolve(source.filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  let text = fs.readFileSync(filePath, 'utf-8');

  // Remove BOM
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  return rows;
}

const csvAdapter: SourceAdapter<CsvSource> = {
  type: 'csv',
  fetch: fetchCsvData,
};

registerAdapter(csvAdapter);
