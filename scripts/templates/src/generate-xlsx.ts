import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';
import { HEADERS, SAMPLE_KO, SAMPLE_EN, toRows } from './data.js';

const OUTPUT_DIR = path.resolve(import.meta.dirname, '..', 'output');

function createSheet(rows: string[][]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths: auto-fit based on max content length
  ws['!cols'] = HEADERS.map((header, i) => {
    const maxLen = Math.max(header.length, ...rows.slice(1).map((row) => (row[i] ?? '').length));
    return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
  });

  // Freeze first row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  return ws;
}

export interface XlsxResult {
  filePath: string;
}

export async function generateXlsx(): Promise<XlsxResult> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const wb = XLSX.utils.book_new();

  const wsKo = createSheet(toRows(SAMPLE_KO));
  XLSX.utils.book_append_sheet(wb, wsKo, '한국어');

  const wsEn = createSheet(toRows(SAMPLE_EN));
  XLSX.utils.book_append_sheet(wb, wsEn, 'English');

  const filePath = path.join(OUTPUT_DIR, 'huh-template.xlsx');
  XLSX.writeFile(wb, filePath);

  return { filePath };
}
