import * as fs from 'fs';
import * as path from 'path';
import { SAMPLE_KO, SAMPLE_EN, toRows } from './data.js';

const OUTPUT_DIR = path.resolve(import.meta.dirname, '..', 'output');

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeField).join(',')).join('\r\n') + '\r\n';
}

export interface CsvResult {
  koPath: string;
  enPath: string;
}

export async function generateCsv(): Promise<CsvResult> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const BOM = '\uFEFF';

  const koPath = path.join(OUTPUT_DIR, 'huh-template-ko.csv');
  fs.writeFileSync(koPath, BOM + toCsv(toRows(SAMPLE_KO)), 'utf-8');

  const enPath = path.join(OUTPUT_DIR, 'huh-template-en.csv');
  fs.writeFileSync(enPath, BOM + toCsv(toRows(SAMPLE_EN)), 'utf-8');

  return { koPath, enPath };
}
