import * as fs from 'fs';
import * as path from 'path';
import type { ErrorConfig } from '@huh/core';
import type {
  ScreenshotResult,
  DeviceConfig,
  TestEntryResult,
  ReportData,
  ExtendedValidationIssue,
} from './types';
import { runExtendedValidation } from './extended-validator';
import { buildReportHtml } from './report-template';

export interface GenerateReportOptions {
  config: ErrorConfig;
  screenshots: ScreenshotResult[];
  device: DeviceConfig;
  mode: 'standalone' | 'app';
  outputDir: string;
}

export function generateReport(options: GenerateReportOptions): ReportData {
  const { config, screenshots, device, mode, outputDir } = options;

  // Run extended validation
  const validation = runExtendedValidation(config, screenshots);

  // Build per-trackId issue maps
  const issuesByTrackId = new Map<string, ExtendedValidationIssue[]>();
  for (const issue of validation.extendedIssues) {
    const arr = issuesByTrackId.get(issue.trackId) ?? [];
    arr.push(issue);
    issuesByTrackId.set(issue.trackId, arr);
  }

  // Convert screenshots to test entry results
  const entries: TestEntryResult[] = screenshots.map((ss) => {
    const trackIssues = issuesByTrackId.get(ss.trackId) ?? [];
    const coreErrors = validation.coreErrors.filter((e) => e.trackId === ss.trackId);
    const coreWarnings = validation.coreWarnings.filter((w) => w.trackId === ss.trackId);

    return {
      trackId: ss.trackId,
      type: ss.type,
      screenshotBase64: ss.buffer.length > 0 ? ss.buffer.toString('base64') : '',
      renderTimeMs: ss.renderTimeMs,
      success: ss.success,
      error: ss.error,
      validationIssues: trackIssues,
      coreValidationErrors: coreErrors,
      coreValidationWarnings: coreWarnings,
    };
  });

  // Count pass/fail/warning
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  for (const entry of entries) {
    if (
      !entry.success ||
      entry.coreValidationErrors.length > 0 ||
      entry.validationIssues.some((i) => i.severity === 'error')
    ) {
      failCount++;
    } else if (
      entry.coreValidationWarnings.length > 0 ||
      entry.validationIssues.some((i) => i.severity === 'warning')
    ) {
      warningCount++;
    } else {
      passCount++;
    }
  }

  const reportData: ReportData = {
    generatedAt: new Date().toISOString(),
    device,
    mode,
    totalEntries: entries.length,
    passCount,
    failCount,
    warningCount,
    entries,
  };

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Write HTML report
  const htmlPath = path.join(outputDir, 'report.html');
  const html = buildReportHtml(reportData);
  fs.writeFileSync(htmlPath, html, 'utf-8');

  // Write report-data.json (without base64 images for smaller size)
  const jsonData: ReportData = {
    ...reportData,
    entries: reportData.entries.map((e) => ({
      ...e,
      screenshotBase64: '', // Omit from JSON for size
    })),
  };
  const jsonPath = path.join(outputDir, 'report-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

  return reportData;
}
