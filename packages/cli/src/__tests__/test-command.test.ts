import { describe, it, expect } from 'vitest';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
import { filterTrackIds } from '../test/utils';
import { DEVICE_CONFIGS } from '../test/types';

describe('filterTrackIds', () => {
  const config: ErrorConfig = {
    ERR_NETWORK: { type: 'TOAST', message: 'Network error' },
    ERR_AUTH: { type: 'MODAL', title: 'Auth', message: 'Auth expired' },
    ERR_NOT_FOUND: { type: 'PAGE', title: '404', message: 'Not found' },
  };

  it('returns all trackIds when no filter', () => {
    const ids = filterTrackIds(config);
    expect(ids).toEqual(['ERR_NETWORK', 'ERR_AUTH', 'ERR_NOT_FOUND']);
  });

  it('filters by trackId', () => {
    const ids = filterTrackIds(config, 'ERR_NETWORK,ERR_AUTH');
    expect(ids).toEqual(['ERR_NETWORK', 'ERR_AUTH']);
  });

  it('filters by type', () => {
    const ids = filterTrackIds(config, undefined, 'TOAST,PAGE');
    expect(ids).toEqual(['ERR_NETWORK', 'ERR_NOT_FOUND']);
  });

  it('combines trackId and type filters', () => {
    const ids = filterTrackIds(config, 'ERR_NETWORK,ERR_AUTH,ERR_NOT_FOUND', 'TOAST');
    expect(ids).toEqual(['ERR_NETWORK']);
  });

  it('returns empty for non-matching filter', () => {
    const ids = filterTrackIds(config, 'ERR_UNKNOWN');
    expect(ids).toEqual([]);
  });

  it('trims whitespace in filter values', () => {
    const ids = filterTrackIds(config, ' ERR_NETWORK , ERR_AUTH ');
    expect(ids).toEqual(['ERR_NETWORK', 'ERR_AUTH']);
  });
});

describe('DEVICE_CONFIGS', () => {
  it('has desktop, mobile, and tablet presets', () => {
    expect(DEVICE_CONFIGS.desktop).toBeDefined();
    expect(DEVICE_CONFIGS.mobile).toBeDefined();
    expect(DEVICE_CONFIGS.tablet).toBeDefined();
  });

  it('desktop is wider than mobile', () => {
    expect(DEVICE_CONFIGS.desktop.width).toBeGreaterThan(DEVICE_CONFIGS.mobile.width);
  });

  it('mobile has isMobile flag', () => {
    expect(DEVICE_CONFIGS.mobile.isMobile).toBe(true);
    expect(DEVICE_CONFIGS.desktop.isMobile).toBe(false);
  });
});
