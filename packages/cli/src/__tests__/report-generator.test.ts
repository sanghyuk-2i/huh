import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
import type { ScreenshotResult } from '../test/types';
import { DEVICE_CONFIGS } from '../test/types';
import { generateReport } from '../test/report-generator';

function makeScreenshot(
  trackId: string,
  overrides: Partial<ScreenshotResult> = {},
): ScreenshotResult {
  return {
    trackId,
    type: 'TOAST',
    buffer: Buffer.from('fake-png-data'),
    width: 1280,
    height: 720,
    renderTimeMs: 200,
    success: true,
    ...overrides,
  };
}

describe('generateReport', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-report-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generates report.html and report-data.json', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test error' },
    };
    const screenshots = [makeScreenshot('ERR_001')];

    generateReport({
      config,
      screenshots,
      device: DEVICE_CONFIGS.desktop,
      mode: 'standalone',
      outputDir: tmpDir,
    });

    expect(fs.existsSync(path.join(tmpDir, 'report.html'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'report-data.json'))).toBe(true);
  });

  it('report.html contains entry trackIds', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Toast msg' },
      ERR_002: { type: 'MODAL', title: 'Title', message: 'Modal msg' },
    };
    const screenshots = [makeScreenshot('ERR_001'), makeScreenshot('ERR_002', { type: 'MODAL' })];

    generateReport({
      config,
      screenshots,
      device: DEVICE_CONFIGS.desktop,
      mode: 'standalone',
      outputDir: tmpDir,
    });

    const html = fs.readFileSync(path.join(tmpDir, 'report.html'), 'utf-8');
    expect(html).toContain('ERR_001');
    expect(html).toContain('ERR_002');
  });

  it('report-data.json has correct counts', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
      ERR_002: { type: 'MODAL', title: 'T', message: 'M' },
    };
    const screenshots = [
      makeScreenshot('ERR_001'),
      makeScreenshot('ERR_002', { type: 'MODAL', success: false, error: 'Timeout' }),
    ];

    const data = generateReport({
      config,
      screenshots,
      device: DEVICE_CONFIGS.desktop,
      mode: 'standalone',
      outputDir: tmpDir,
    });

    expect(data.totalEntries).toBe(2);
    expect(data.failCount).toBe(1);
    expect(data.passCount).toBe(1);
  });

  it('report-data.json omits base64 images', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const screenshots = [makeScreenshot('ERR_001')];

    generateReport({
      config,
      screenshots,
      device: DEVICE_CONFIGS.desktop,
      mode: 'standalone',
      outputDir: tmpDir,
    });

    const jsonData = JSON.parse(fs.readFileSync(path.join(tmpDir, 'report-data.json'), 'utf-8'));
    expect(jsonData.entries[0].screenshotBase64).toBe('');
  });

  it('creates output directory if it does not exist', () => {
    const nested = path.join(tmpDir, 'nested', 'deep');
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const screenshots = [makeScreenshot('ERR_001')];

    generateReport({
      config,
      screenshots,
      device: DEVICE_CONFIGS.desktop,
      mode: 'standalone',
      outputDir: nested,
    });

    expect(fs.existsSync(path.join(nested, 'report.html'))).toBe(true);
  });

  it('report HTML embeds screenshots as base64', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const screenshots = [makeScreenshot('ERR_001')];

    generateReport({
      config,
      screenshots,
      device: DEVICE_CONFIGS.desktop,
      mode: 'standalone',
      outputDir: tmpDir,
    });

    const html = fs.readFileSync(path.join(tmpDir, 'report.html'), 'utf-8');
    expect(html).toContain('data:image/png;base64,');
  });
});
