import { describe, it, expect } from 'vitest';
import type { ErrorConfig } from '@huh/core';
import type { ScreenshotResult } from '../test/types';
import { runExtendedValidation } from '../test/extended-validator';

function makeScreenshot(
  trackId: string,
  overrides: Partial<ScreenshotResult> = {},
): ScreenshotResult {
  return {
    trackId,
    type: 'TOAST',
    buffer: Buffer.from('fake-png'),
    width: 1280,
    height: 720,
    renderTimeMs: 200,
    success: true,
    ...overrides,
  };
}

describe('runExtendedValidation', () => {
  it('returns core validation errors for missing fields', () => {
    const config: ErrorConfig = {
      ERR_001: { type: '', message: '' } as any,
    };
    const screenshots = [makeScreenshot('ERR_001')];
    const result = runExtendedValidation(config, screenshots);

    expect(result.coreErrors.length).toBeGreaterThan(0);
  });

  it('detects render failures', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const screenshots = [makeScreenshot('ERR_001', { success: false, error: 'Timeout' })];
    const result = runExtendedValidation(config, screenshots);

    const renderFailures = result.extendedIssues.filter((i) => i.kind === 'render-failure');
    expect(renderFailures).toHaveLength(1);
    expect(renderFailures[0].severity).toBe('error');
    expect(renderFailures[0].message).toContain('Timeout');
  });

  it('detects invalid image URLs', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'PAGE', message: 'Test', image: 'not-a-url' },
    };
    const screenshots = [makeScreenshot('ERR_001')];
    const result = runExtendedValidation(config, screenshots);

    const imageIssues = result.extendedIssues.filter((i) => i.kind === 'image-url-broken');
    expect(imageIssues).toHaveLength(1);
  });

  it('accepts valid image URLs', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'PAGE', message: 'Test', image: 'https://example.com/img.png' },
    };
    const screenshots = [makeScreenshot('ERR_001')];
    const result = runExtendedValidation(config, screenshots);

    const imageIssues = result.extendedIssues.filter((i) => i.kind === 'image-url-broken');
    expect(imageIssues).toHaveLength(0);
  });

  it('warns when TOAST message exceeds max length', () => {
    const longMessage = 'A'.repeat(150);
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: longMessage },
    };
    const screenshots = [makeScreenshot('ERR_001')];
    const result = runExtendedValidation(config, screenshots);

    const lengthIssues = result.extendedIssues.filter((i) => i.kind === 'message-too-long');
    expect(lengthIssues).toHaveLength(1);
    expect(lengthIssues[0].message).toContain('120');
  });

  it('does not warn for short messages', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Short message' },
    };
    const screenshots = [makeScreenshot('ERR_001')];
    const result = runExtendedValidation(config, screenshots);

    const lengthIssues = result.extendedIssues.filter((i) => i.kind === 'message-too-long');
    expect(lengthIssues).toHaveLength(0);
  });

  it('detects slow renders', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const screenshots = [makeScreenshot('ERR_001', { renderTimeMs: 5000 })];
    const result = runExtendedValidation(config, screenshots);

    const slowIssues = result.extendedIssues.filter((i) => i.kind === 'slow-render');
    expect(slowIssues).toHaveLength(1);
  });

  it('detects unresolved template variables', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'MODAL', title: '{{userName}}님 안녕', message: '{{count}}개 남음' },
    };
    const screenshots = [makeScreenshot('ERR_001')];
    const result = runExtendedValidation(config, screenshots);

    const varIssues = result.extendedIssues.filter((i) => i.kind === 'missing-template-variable');
    expect(varIssues).toHaveLength(1);
    expect(varIssues[0].message).toContain('{{userName}}');
    expect(varIssues[0].message).toContain('{{count}}');
  });

  it('handles entries without screenshots', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const result = runExtendedValidation(config, []);

    // Should not throw, just no render-related issues
    expect(result.extendedIssues.filter((i) => i.kind === 'render-failure')).toHaveLength(0);
  });

  it('handles multiple entries', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'A'.repeat(150) },
      ERR_002: { type: 'PAGE', message: 'OK', image: 'invalid' },
    };
    const screenshots = [
      makeScreenshot('ERR_001'),
      makeScreenshot('ERR_002', { success: false, error: 'Failed' }),
    ];
    const result = runExtendedValidation(config, screenshots);

    expect(result.extendedIssues.length).toBeGreaterThanOrEqual(3); // long msg + bad image + render failure
  });
});
