import * as fs from 'fs';
import * as path from 'path';
import type { ReportData, DiffEntry, DiffResult } from './types';

export function loadPreviousReport(outputDir: string): ReportData | null {
  const jsonPath = path.join(outputDir, 'report-data.json');
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(raw) as ReportData;
  } catch {
    return null;
  }
}

export function diffReports(
  previous: ReportData,
  current: ReportData,
): DiffResult {
  const prevMap = new Map(previous.entries.map((e) => [e.trackId, e]));
  const currMap = new Map(current.entries.map((e) => [e.trackId, e]));

  const added: DiffEntry[] = [];
  const removed: DiffEntry[] = [];
  const changed: DiffEntry[] = [];
  const unchanged: DiffEntry[] = [];

  // Check current entries against previous
  for (const [trackId, currEntry] of currMap) {
    const prevEntry = prevMap.get(trackId);

    if (!prevEntry) {
      added.push({ trackId, status: 'added', details: `New entry (${currEntry.type})` });
      continue;
    }

    const changes = detectChanges(prevEntry, currEntry);
    if (changes.length > 0) {
      changed.push({ trackId, status: 'changed', details: changes.join('; ') });
    } else {
      unchanged.push({ trackId, status: 'unchanged' });
    }
  }

  // Check for removed entries
  for (const trackId of prevMap.keys()) {
    if (!currMap.has(trackId)) {
      removed.push({ trackId, status: 'removed', details: 'Entry no longer present' });
    }
  }

  const parts: string[] = [];
  if (added.length > 0) parts.push(`${added.length} added`);
  if (removed.length > 0) parts.push(`${removed.length} removed`);
  if (changed.length > 0) parts.push(`${changed.length} changed`);
  if (unchanged.length > 0) parts.push(`${unchanged.length} unchanged`);
  const summary = parts.join(', ') || 'No entries';

  return { added, removed, changed, unchanged, summary };
}

interface EntryLike {
  trackId: string;
  type: string;
  success: boolean;
  error?: string;
  renderTimeMs: number;
  validationIssues: { kind: string; message: string }[];
  coreValidationErrors: { message: string }[];
  coreValidationWarnings: { message: string }[];
}

function detectChanges(prev: EntryLike, curr: EntryLike): string[] {
  const changes: string[] = [];

  if (prev.type !== curr.type) {
    changes.push(`type: ${prev.type} -> ${curr.type}`);
  }

  if (prev.success !== curr.success) {
    changes.push(`status: ${prev.success ? 'pass' : 'fail'} -> ${curr.success ? 'pass' : 'fail'}`);
  }

  const prevIssueCount = prev.validationIssues.length + prev.coreValidationErrors.length;
  const currIssueCount = curr.validationIssues.length + curr.coreValidationErrors.length;
  if (prevIssueCount !== currIssueCount) {
    changes.push(`issues: ${prevIssueCount} -> ${currIssueCount}`);
  }

  const prevWarnCount = prev.coreValidationWarnings.length;
  const currWarnCount = curr.coreValidationWarnings.length;
  if (prevWarnCount !== currWarnCount) {
    changes.push(`warnings: ${prevWarnCount} -> ${currWarnCount}`);
  }

  return changes;
}
