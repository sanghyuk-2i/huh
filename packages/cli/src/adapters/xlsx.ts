import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';
import type { XlsxSource } from '../commands/init';
import { registerAdapter } from './registry';
import type { SourceAdapter } from './types';

export async function fetchXlsxData(source: XlsxSource): Promise<string[][]> {
  const filePath = path.resolve(source.filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`XLSX file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);

  const sheetName = source.sheet ?? workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(
      `Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`,
    );
  }

  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (rows.length < 2) {
    throw new Error('XLSX file must contain at least a header row and one data row');
  }

  return rows;
}

const xlsxAdapter: SourceAdapter<XlsxSource> = {
  type: 'xlsx',
  fetch: fetchXlsxData,
};

registerAdapter(xlsxAdapter);
