import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseCsv, fetchCsvData } from '../adapters/csv';

describe('parseCsv', () => {
  it('parses basic CSV', () => {
    const result = parseCsv('a,b,c\n1,2,3');
    expect(result).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields', () => {
    const result = parseCsv('name,desc\n"Alice","Hello, World"');
    expect(result).toEqual([
      ['name', 'desc'],
      ['Alice', 'Hello, World'],
    ]);
  });

  it('handles escaped quotes within quoted fields', () => {
    const result = parseCsv('a,b\n"say ""hello""",value');
    expect(result).toEqual([
      ['a', 'b'],
      ['say "hello"', 'value'],
    ]);
  });

  it('handles newlines within quoted fields', () => {
    const result = parseCsv('a,b\n"line1\nline2",value');
    expect(result).toEqual([
      ['a', 'b'],
      ['line1\nline2', 'value'],
    ]);
  });

  it('handles CRLF line endings', () => {
    const result = parseCsv('a,b\r\n1,2\r\n3,4');
    expect(result).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('handles empty fields', () => {
    const result = parseCsv('a,,c\n,2,');
    expect(result).toEqual([
      ['a', '', 'c'],
      ['', '2', ''],
    ]);
  });

  it('handles trailing newline', () => {
    const result = parseCsv('a,b\n1,2\n');
    expect(result).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('fetchCsvData', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-csv-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads and parses a CSV file', async () => {
    const csvPath = path.join(tmpDir, 'test.csv');
    fs.writeFileSync(csvPath, 'trackId,type,message\nERR_001,toast,Error\n', 'utf-8');

    const rows = await fetchCsvData({ type: 'csv', filePath: csvPath });

    expect(rows).toEqual([
      ['trackId', 'type', 'message'],
      ['ERR_001', 'toast', 'Error'],
    ]);
  });

  it('throws when file not found', async () => {
    await expect(
      fetchCsvData({ type: 'csv', filePath: path.join(tmpDir, 'missing.csv') }),
    ).rejects.toThrow('CSV file not found');
  });

  it('throws when file has fewer than 2 rows', async () => {
    const csvPath = path.join(tmpDir, 'header-only.csv');
    fs.writeFileSync(csvPath, 'trackId,type,message\n', 'utf-8');

    await expect(fetchCsvData({ type: 'csv', filePath: csvPath })).rejects.toThrow(
      'CSV file must contain at least a header row and one data row',
    );
  });

  it('removes BOM from file', async () => {
    const csvPath = path.join(tmpDir, 'bom.csv');
    fs.writeFileSync(csvPath, '\uFEFFtrackId,type,message\nERR_001,toast,Error\n', 'utf-8');

    const rows = await fetchCsvData({ type: 'csv', filePath: csvPath });

    expect(rows[0][0]).toBe('trackId');
  });
});
