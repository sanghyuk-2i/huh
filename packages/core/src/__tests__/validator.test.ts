import { describe, it, expect } from 'vitest';
import { validateConfig } from '../validator';
import type { ErrorConfig } from '../schema';

describe('validateConfig', () => {
  it('returns valid for correct config', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'Something failed' },
      ERR_002: {
        type: 'MODAL',
        message: 'Session expired',
        title: 'Error',
        action: { label: 'Retry', type: 'RETRY' },
      },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing type', () => {
    const config = {
      ERR_001: { type: '', message: 'test' },
    } as unknown as ErrorConfig;
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('type');
  });

  it('accepts custom types without error', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'BANNER', message: 'Custom type works' },
      ERR_002: { type: 'SNACKBAR', message: 'Another custom' },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing message', () => {
    const config = {
      ERR_001: { type: 'TOAST', message: '' },
    } as ErrorConfig;
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('message');
  });

  it('reports error for action missing label', () => {
    const config: ErrorConfig = {
      ERR_001: {
        type: 'MODAL',
        message: 'test',
        action: { label: '', type: 'RETRY' },
      },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'action.label')).toBe(true);
  });

  it('reports error for REDIRECT without target', () => {
    const config: ErrorConfig = {
      ERR_001: {
        type: 'MODAL',
        message: 'test',
        action: { label: 'Go', type: 'REDIRECT' },
      },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'action.target')).toBe(true);
  });

  it('accepts custom action types without error', () => {
    const config: ErrorConfig = {
      ERR_001: {
        type: 'MODAL',
        message: 'test',
        action: { label: 'Open chat', type: 'OPEN_CHAT' },
      },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
  });

  it('warns for TOAST with title', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'TOAST', message: 'test', title: 'Title' },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.field === 'title')).toBe(true);
  });

  it('warns for PAGE without action', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'PAGE', message: 'test', title: 'Error' },
    };
    const result = validateConfig(config);
    expect(result.warnings.some((w) => w.field === 'action')).toBe(true);
  });

  it('warns for empty config', () => {
    const result = validateConfig({});
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].message).toContain('empty');
  });

  it('does not warn for custom types with title/image', () => {
    const config: ErrorConfig = {
      ERR_001: { type: 'BANNER', message: 'test', title: 'Title', image: '/img.png' },
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
