import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAirtableData, airtableRecordsToRows } from '../fetch-airtable';

describe('airtableRecordsToRows', () => {
  it('converts Airtable records to 2D string array with header row', () => {
    const records = [
      {
        id: 'rec1',
        fields: {
          trackId: 'ERR_001',
          type: 'toast',
          message: 'Something went wrong',
          title: '',
          image: '',
          actionLabel: 'Retry',
          actionType: 'retry',
          actionTarget: '',
        },
      },
      {
        id: 'rec2',
        fields: {
          trackId: 'ERR_002',
          type: 'modal',
          message: 'Payment failed',
          title: 'Payment Error',
          image: '',
          actionLabel: 'Contact Support',
          actionType: 'redirect',
          actionTarget: '/support',
        },
      },
    ];

    const rows = airtableRecordsToRows(records);

    expect(rows[0]).toEqual([
      'trackId',
      'type',
      'message',
      'title',
      'image',
      'severity',
      'actionLabel',
      'actionType',
      'actionTarget',
    ]);
    expect(rows[1]).toEqual([
      'ERR_001',
      'toast',
      'Something went wrong',
      '',
      '',
      '',
      'Retry',
      'retry',
      '',
    ]);
    expect(rows[2]).toEqual([
      'ERR_002',
      'modal',
      'Payment failed',
      'Payment Error',
      '',
      '',
      'Contact Support',
      'redirect',
      '/support',
    ]);
    expect(rows).toHaveLength(3);
  });

  it('handles missing fields as empty strings', () => {
    const records = [
      {
        id: 'rec1',
        fields: {
          trackId: 'ERR_001',
          type: 'toast',
          message: 'Error occurred',
        },
      },
    ];

    const rows = airtableRecordsToRows(records);

    expect(rows[1]).toEqual(['ERR_001', 'toast', 'Error occurred', '', '', '', '', '', '']);
  });

  it('handles null field values as empty strings', () => {
    const records = [
      {
        id: 'rec1',
        fields: {
          trackId: 'ERR_001',
          type: 'toast',
          message: 'Error',
          title: null,
          actionLabel: undefined,
        } as any,
      },
    ];

    const rows = airtableRecordsToRows(records);

    expect(rows[1][3]).toBe('');
    expect(rows[1][5]).toBe('');
  });
});

describe('fetchAirtableData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.AIRTABLE_TOKEN;
  });

  it('throws when no token is provided', async () => {
    await expect(
      fetchAirtableData({ type: 'airtable', baseId: 'appXXX', tableId: 'tblYYY' }),
    ).rejects.toThrow('Airtable token is required');
  });

  it('uses env variable token as fallback', async () => {
    process.env.AIRTABLE_TOKEN = 'pat_test_token';

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [{ id: 'rec1', fields: { trackId: 'ERR_001', type: 'toast', message: 'Test' } }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const rows = await fetchAirtableData({
      type: 'airtable',
      baseId: 'appXXX',
      tableId: 'tblYYY',
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Bearer pat_test_token');
    expect(rows).toHaveLength(2); // header + 1 data row
  });

  it('handles pagination with offset', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: [
            { id: 'rec1', fields: { trackId: 'ERR_001', type: 'toast', message: 'Error 1' } },
          ],
          offset: 'next_page',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: [
            { id: 'rec2', fields: { trackId: 'ERR_002', type: 'modal', message: 'Error 2' } },
          ],
        }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const rows = await fetchAirtableData({
      type: 'airtable',
      baseId: 'appXXX',
      tableId: 'tblYYY',
      token: 'pat_test',
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(rows).toHaveLength(3); // header + 2 data rows
    expect(rows[1][0]).toBe('ERR_001');
    expect(rows[2][0]).toBe('ERR_002');

    // Second call should include offset parameter
    const secondCallUrl = mockFetch.mock.calls[1][0];
    expect(secondCallUrl).toContain('offset=next_page');
  });

  it('throws on API error response', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchAirtableData({
        type: 'airtable',
        baseId: 'appXXX',
        tableId: 'tblYYY',
        token: 'bad_token',
      }),
    ).rejects.toThrow('Airtable API error: 401 Unauthorized');
  });

  it('throws when no records found', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ records: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchAirtableData({
        type: 'airtable',
        baseId: 'appXXX',
        tableId: 'tblYYY',
        token: 'pat_test',
      }),
    ).rejects.toThrow('No records found in Airtable table');
  });
});
