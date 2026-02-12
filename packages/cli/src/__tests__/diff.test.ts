import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ReportData, TestEntryResult } from '../test/types';
import { diffReports, loadPreviousReport } from '../test/diff';

function makeEntry(trackId: string, overrides: Partial<TestEntryResult> = {}): TestEntryResult {
  return {
    trackId,
    type: 'TOAST',
    screenshotBase64: '',
    renderTimeMs: 200,
    success: true,
    validationIssues: [],
    coreValidationErrors: [],
    coreValidationWarnings: [],
    ...overrides,
  };
}

function makeReport(entries: TestEntryResult[]): ReportData {
  return {
    generatedAt: '2025-01-01T00:00:00Z',
    device: { name: 'Desktop', width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false },
    mode: 'standalone',
    totalEntries: entries.length,
    passCount: entries.filter((e) => e.success).length,
    failCount: entries.filter((e) => !e.success).length,
    warningCount: 0,
    entries,
  };
}

describe('diffReports', () => {
  it('detects added entries', () => {
    const prev = makeReport([makeEntry('ERR_001')]);
    const curr = makeReport([makeEntry('ERR_001'), makeEntry('ERR_002')]);

    const diff = diffReports(prev, curr);

    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].trackId).toBe('ERR_002');
    expect(diff.removed).toHaveLength(0);
  });

  it('detects removed entries', () => {
    const prev = makeReport([makeEntry('ERR_001'), makeEntry('ERR_002')]);
    const curr = makeReport([makeEntry('ERR_001')]);

    const diff = diffReports(prev, curr);

    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].trackId).toBe('ERR_002');
  });

  it('detects changed entries (status changed)', () => {
    const prev = makeReport([makeEntry('ERR_001', { success: true })]);
    const curr = makeReport([makeEntry('ERR_001', { success: false })]);

    const diff = diffReports(prev, curr);

    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].details).toContain('status');
  });

  it('detects changed entries (type changed)', () => {
    const prev = makeReport([makeEntry('ERR_001', { type: 'TOAST' })]);
    const curr = makeReport([makeEntry('ERR_001', { type: 'MODAL' })]);

    const diff = diffReports(prev, curr);

    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].details).toContain('type');
  });

  it('detects unchanged entries', () => {
    const prev = makeReport([makeEntry('ERR_001')]);
    const curr = makeReport([makeEntry('ERR_001')]);

    const diff = diffReports(prev, curr);

    expect(diff.unchanged).toHaveLength(1);
    expect(diff.changed).toHaveLength(0);
  });

  it('generates a summary string', () => {
    const prev = makeReport([makeEntry('ERR_001'), makeEntry('ERR_002')]);
    const curr = makeReport([makeEntry('ERR_001'), makeEntry('ERR_003')]);

    const diff = diffReports(prev, curr);

    expect(diff.summary).toContain('added');
    expect(diff.summary).toContain('removed');
    expect(diff.summary).toContain('unchanged');
  });

  it('handles empty reports', () => {
    const prev = makeReport([]);
    const curr = makeReport([]);

    const diff = diffReports(prev, curr);

    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
    expect(diff.unchanged).toHaveLength(0);
  });

  it('detects changed issue counts', () => {
    const prev = makeReport([makeEntry('ERR_001', { coreValidationErrors: [] })]);
    const curr = makeReport([
      makeEntry('ERR_001', {
        coreValidationErrors: [{ message: 'new error' }],
      }),
    ]);

    const diff = diffReports(prev, curr);
    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].details).toContain('issues');
  });
});

describe('loadPreviousReport', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-diff-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when no previous report exists', () => {
    expect(loadPreviousReport(tmpDir)).toBeNull();
  });

  it('loads a previous report-data.json', () => {
    const report = makeReport([makeEntry('ERR_001')]);
    fs.writeFileSync(path.join(tmpDir, 'report-data.json'), JSON.stringify(report), 'utf-8');

    const loaded = loadPreviousReport(tmpDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.entries).toHaveLength(1);
    expect(loaded!.entries[0].trackId).toBe('ERR_001');
  });

  it('returns null for invalid JSON', () => {
    fs.writeFileSync(path.join(tmpDir, 'report-data.json'), 'not json', 'utf-8');
    expect(loadPreviousReport(tmpDir)).toBeNull();
  });
});
