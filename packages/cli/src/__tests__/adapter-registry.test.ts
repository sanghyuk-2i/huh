import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerAdapter,
  getAdapter,
  getRegisteredTypes,
  clearAdapters,
} from '../adapters/registry';
import type { SourceAdapter } from '../adapters/types';
import type { HuhSource } from '../commands/init';

describe('adapter registry', () => {
  beforeEach(() => {
    clearAdapters();
  });

  it('registers and retrieves an adapter', () => {
    const adapter: SourceAdapter = {
      type: 'google-sheets',
      async fetch() {
        return [['header'], ['data']];
      },
    };

    registerAdapter(adapter);

    const result = getAdapter({ type: 'google-sheets', sheetId: 'test' } as HuhSource);
    expect(result).toBe(adapter);
  });

  it('throws on duplicate registration', () => {
    const adapter: SourceAdapter = {
      type: 'airtable',
      async fetch() {
        return [];
      },
    };

    registerAdapter(adapter);

    expect(() => registerAdapter(adapter)).toThrow('Adapter already registered for type: airtable');
  });

  it('throws when getting unregistered adapter', () => {
    expect(() => getAdapter({ type: 'google-sheets', sheetId: 'test' } as HuhSource)).toThrow(
      'No adapter registered for source type: google-sheets',
    );
  });

  it('returns registered types', () => {
    registerAdapter({
      type: 'google-sheets',
      async fetch() {
        return [];
      },
    });
    registerAdapter({
      type: 'airtable',
      async fetch() {
        return [];
      },
    });

    const types = getRegisteredTypes();
    expect(types).toEqual(['google-sheets', 'airtable']);
  });

  it('clearAdapters removes all adapters', () => {
    registerAdapter({
      type: 'notion',
      async fetch() {
        return [];
      },
    });
    expect(getRegisteredTypes()).toHaveLength(1);

    clearAdapters();
    expect(getRegisteredTypes()).toHaveLength(0);
  });
});

describe('default adapter registration', () => {
  it('registers all 5 adapters when importing barrel', async () => {
    // Re-import the barrel to trigger registrations
    const { getRegisteredTypes: getTypes } = await import('../adapters');
    const types = getTypes();

    expect(types).toContain('google-sheets');
    expect(types).toContain('airtable');
    expect(types).toContain('notion');
    expect(types).toContain('csv');
    expect(types).toContain('xlsx');
    expect(types).toHaveLength(5);
  });
});
