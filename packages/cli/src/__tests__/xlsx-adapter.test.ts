import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import XLSX from 'xlsx';
import { fetchXlsxData } from '../adapters/xlsx';

describe('fetchXlsxData', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-xlsx-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function createXlsx(
    filePath: string,
    data: string[][],
    sheetName = 'Sheet1',
    extraSheets?: Record<string, string[][]>,
  ) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    if (extraSheets) {
      for (const [name, rows] of Object.entries(extraSheets)) {
        const extraWs = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, extraWs, name);
      }
    }

    XLSX.writeFile(wb, filePath);
  }

  it('reads and parses an XLSX file', async () => {
    const xlsxPath = path.join(tmpDir, 'test.xlsx');
    createXlsx(xlsxPath, [
      ['trackId', 'type', 'message'],
      ['ERR_001', 'toast', 'Error occurred'],
    ]);

    const rows = await fetchXlsxData({ type: 'xlsx', filePath: xlsxPath });

    expect(rows).toEqual([
      ['trackId', 'type', 'message'],
      ['ERR_001', 'toast', 'Error occurred'],
    ]);
  });

  it('uses first sheet by default', async () => {
    const xlsxPath = path.join(tmpDir, 'multi.xlsx');
    createXlsx(
      xlsxPath,
      [
        ['trackId', 'type', 'message'],
        ['ERR_001', 'toast', 'First sheet'],
      ],
      'Errors',
      {
        Other: [['col1'], ['val1']],
      },
    );

    const rows = await fetchXlsxData({ type: 'xlsx', filePath: xlsxPath });

    expect(rows[1][2]).toBe('First sheet');
  });

  it('uses specified sheet name', async () => {
    const xlsxPath = path.join(tmpDir, 'multi.xlsx');
    createXlsx(xlsxPath, [['col1'], ['val1'], ['val2']], 'First', {
      Errors: [
        ['trackId', 'type', 'message'],
        ['ERR_001', 'toast', 'Target sheet'],
      ],
    });

    const rows = await fetchXlsxData({ type: 'xlsx', filePath: xlsxPath, sheet: 'Errors' });

    expect(rows[1][2]).toBe('Target sheet');
  });

  it('throws when sheet not found', async () => {
    const xlsxPath = path.join(tmpDir, 'test.xlsx');
    createXlsx(xlsxPath, [
      ['trackId', 'type', 'message'],
      ['ERR_001', 'toast', 'Error'],
    ]);

    await expect(
      fetchXlsxData({ type: 'xlsx', filePath: xlsxPath, sheet: 'NonExistent' }),
    ).rejects.toThrow('Sheet "NonExistent" not found');
  });

  it('throws when file not found', async () => {
    await expect(
      fetchXlsxData({ type: 'xlsx', filePath: path.join(tmpDir, 'missing.xlsx') }),
    ).rejects.toThrow('XLSX file not found');
  });
});
