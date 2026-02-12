import { describe, it, expect } from 'vitest';
import { validateLocales } from '../locale-validator';
import type { LocalizedErrorConfig } from '../schema';

describe('validateLocales', () => {
  it('returns valid for consistent locales', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: { type: 'MODAL', message: '인증 만료', title: '인증 오류' },
        ERR_NETWORK: { type: 'TOAST', message: '네트워크 오류' },
      },
      en: {
        ERR_AUTH: { type: 'MODAL', message: 'Session expired', title: 'Auth Error' },
        ERR_NETWORK: { type: 'TOAST', message: 'Network error' },
      },
    };
    const result = validateLocales(locales);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('reports error for missing trackId in a locale', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: { type: 'MODAL', message: '인증 만료' },
        ERR_NETWORK: { type: 'TOAST', message: '네트워크 오류' },
      },
      en: {
        ERR_AUTH: { type: 'MODAL', message: 'Session expired' },
      },
    };
    const result = validateLocales(locales);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].trackId).toBe('ERR_NETWORK');
    expect(result.errors[0].locales).toContain('en');
  });

  it('warns for type mismatch across locales', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: { type: 'MODAL', message: '인증 만료' },
      },
      en: {
        ERR_AUTH: { type: 'TOAST', message: 'Session expired' },
      },
    };
    const result = validateLocales(locales);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].field).toBe('type');
    expect(result.warnings[0].trackId).toBe('ERR_AUTH');
  });

  it('warns for actionType mismatch across locales', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: {
          type: 'MODAL',
          message: '인증 만료',
          action: { label: '로그인', type: 'REDIRECT', target: '/login' },
        },
      },
      en: {
        ERR_AUTH: {
          type: 'MODAL',
          message: 'Session expired',
          action: { label: 'Retry', type: 'RETRY' },
        },
      },
    };
    const result = validateLocales(locales);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.field === 'action.type')).toBe(true);
  });

  it('skips validation for single locale', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: { type: 'MODAL', message: '인증 만료' },
      },
    };
    const result = validateLocales(locales);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('handles three locales with missing trackIds', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: { type: 'MODAL', message: '인증 만료' },
        ERR_NETWORK: { type: 'TOAST', message: '네트워크 오류' },
      },
      en: {
        ERR_AUTH: { type: 'MODAL', message: 'Session expired' },
        ERR_NETWORK: { type: 'TOAST', message: 'Network error' },
      },
      ja: {
        ERR_AUTH: { type: 'MODAL', message: '認証期限切れ' },
      },
    };
    const result = validateLocales(locales);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].trackId).toBe('ERR_NETWORK');
    expect(result.errors[0].locales).toContain('ja');
  });

  it('detects actionType mismatch when one locale has no action', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: {
          type: 'MODAL',
          message: '인증 만료',
          action: { label: '로그인', type: 'REDIRECT', target: '/login' },
        },
      },
      en: {
        ERR_AUTH: { type: 'MODAL', message: 'Session expired' },
      },
    };
    const result = validateLocales(locales);
    expect(result.warnings.some((w) => w.field === 'action.type')).toBe(true);
  });
});
