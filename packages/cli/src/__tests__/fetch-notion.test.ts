import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNotionData, notionPagesToRows, extractPropertyValue } from '../fetch-notion';

describe('extractPropertyValue', () => {
  it('extracts title property', () => {
    expect(
      extractPropertyValue({
        type: 'title',
        title: [{ plain_text: 'ERR_001' }],
      }),
    ).toBe('ERR_001');
  });

  it('extracts rich_text property', () => {
    expect(
      extractPropertyValue({
        type: 'rich_text',
        rich_text: [{ plain_text: 'Something went wrong' }],
      }),
    ).toBe('Something went wrong');
  });

  it('joins multiple rich_text segments', () => {
    expect(
      extractPropertyValue({
        type: 'rich_text',
        rich_text: [{ plain_text: 'Hello ' }, { plain_text: 'World' }],
      }),
    ).toBe('Hello World');
  });

  it('extracts select property', () => {
    expect(
      extractPropertyValue({
        type: 'select',
        select: { name: 'toast' },
      }),
    ).toBe('toast');
  });

  it('handles null select', () => {
    expect(
      extractPropertyValue({
        type: 'select',
        select: null,
      }),
    ).toBe('');
  });

  it('extracts url property', () => {
    expect(
      extractPropertyValue({
        type: 'url',
        url: 'https://example.com',
      }),
    ).toBe('https://example.com');
  });

  it('handles null url', () => {
    expect(
      extractPropertyValue({
        type: 'url',
        url: null,
      }),
    ).toBe('');
  });

  it('extracts number property', () => {
    expect(
      extractPropertyValue({
        type: 'number',
        number: 42,
      }),
    ).toBe('42');
  });

  it('handles unknown property type', () => {
    expect(
      extractPropertyValue({
        type: 'checkbox' as any,
      }),
    ).toBe('');
  });
});

describe('notionPagesToRows', () => {
  it('converts Notion pages to 2D string array with header row', () => {
    const pages = [
      {
        id: 'page1',
        properties: {
          trackId: { type: 'title', title: [{ plain_text: 'ERR_001' }] },
          type: { type: 'select', select: { name: 'toast' } },
          message: { type: 'rich_text', rich_text: [{ plain_text: 'Error occurred' }] },
          title: { type: 'rich_text', rich_text: [] },
          image: { type: 'url', url: null },
          actionLabel: { type: 'rich_text', rich_text: [{ plain_text: 'Retry' }] },
          actionType: { type: 'select', select: { name: 'retry' } },
          actionTarget: { type: 'url', url: null },
        },
      },
      {
        id: 'page2',
        properties: {
          trackId: { type: 'title', title: [{ plain_text: 'ERR_002' }] },
          type: { type: 'select', select: { name: 'page' } },
          message: { type: 'rich_text', rich_text: [{ plain_text: 'Not found' }] },
          title: { type: 'rich_text', rich_text: [{ plain_text: 'Page Not Found' }] },
          image: { type: 'url', url: null },
          actionLabel: { type: 'rich_text', rich_text: [{ plain_text: 'Go home' }] },
          actionType: { type: 'select', select: { name: 'redirect' } },
          actionTarget: { type: 'url', url: '/' },
        },
      },
    ];

    const rows = notionPagesToRows(pages as any);

    expect(rows[0]).toEqual([
      'trackId',
      'type',
      'message',
      'title',
      'image',
      'actionLabel',
      'actionType',
      'actionTarget',
    ]);
    expect(rows[1]).toEqual(['ERR_001', 'toast', 'Error occurred', '', '', 'Retry', 'retry', '']);
    expect(rows[2]).toEqual([
      'ERR_002',
      'page',
      'Not found',
      'Page Not Found',
      '',
      'Go home',
      'redirect',
      '/',
    ]);
    expect(rows).toHaveLength(3);
  });

  it('handles pages with missing properties', () => {
    const pages = [
      {
        id: 'page1',
        properties: {
          trackId: { type: 'title', title: [{ plain_text: 'ERR_001' }] },
          type: { type: 'select', select: { name: 'toast' } },
          message: { type: 'rich_text', rich_text: [{ plain_text: 'Error' }] },
        },
      },
    ];

    const rows = notionPagesToRows(pages as any);

    expect(rows[1]).toEqual(['ERR_001', 'toast', 'Error', '', '', '', '', '']);
  });
});

describe('fetchNotionData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NOTION_TOKEN;
  });

  it('throws when no token is provided', async () => {
    await expect(
      fetchNotionData({ type: 'notion', databaseId: 'db_xxx' }),
    ).rejects.toThrow('Notion token is required');
  });

  it('uses env variable token as fallback', async () => {
    process.env.NOTION_TOKEN = 'ntn_test_token';

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 'page1',
            properties: {
              trackId: { type: 'title', title: [{ plain_text: 'ERR_001' }] },
              type: { type: 'select', select: { name: 'toast' } },
              message: { type: 'rich_text', rich_text: [{ plain_text: 'Test' }] },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const rows = await fetchNotionData({ type: 'notion', databaseId: 'db_xxx' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBe('Bearer ntn_test_token');
    expect(callHeaders['Notion-Version']).toBe('2022-06-28');
    expect(rows).toHaveLength(2); // header + 1 data row
  });

  it('handles pagination with cursor', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 'page1',
              properties: {
                trackId: { type: 'title', title: [{ plain_text: 'ERR_001' }] },
                type: { type: 'select', select: { name: 'toast' } },
                message: { type: 'rich_text', rich_text: [{ plain_text: 'Error 1' }] },
              },
            },
          ],
          has_more: true,
          next_cursor: 'cursor_abc',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 'page2',
              properties: {
                trackId: { type: 'title', title: [{ plain_text: 'ERR_002' }] },
                type: { type: 'select', select: { name: 'modal' } },
                message: { type: 'rich_text', rich_text: [{ plain_text: 'Error 2' }] },
              },
            },
          ],
          has_more: false,
          next_cursor: null,
        }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const rows = await fetchNotionData({
      type: 'notion',
      databaseId: 'db_xxx',
      token: 'ntn_test',
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(rows).toHaveLength(3); // header + 2 data rows
    expect(rows[1][0]).toBe('ERR_001');
    expect(rows[2][0]).toBe('ERR_002');

    // Second call should include cursor in body
    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(secondCallBody.start_cursor).toBe('cursor_abc');
  });

  it('throws on API error response', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchNotionData({
        type: 'notion',
        databaseId: 'db_xxx',
        token: 'bad_token',
      }),
    ).rejects.toThrow('Notion API error: 404 Not Found');
  });

  it('throws when no pages found', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        has_more: false,
        next_cursor: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchNotionData({
        type: 'notion',
        databaseId: 'db_xxx',
        token: 'ntn_test',
      }),
    ).rejects.toThrow('No pages found in Notion database');
  });

  it('sends POST request with correct content type', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 'page1',
            properties: {
              trackId: { type: 'title', title: [{ plain_text: 'ERR_001' }] },
              type: { type: 'select', select: { name: 'toast' } },
              message: { type: 'rich_text', rich_text: [{ plain_text: 'Test' }] },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchNotionData({
      type: 'notion',
      databaseId: 'db_xxx',
      token: 'ntn_test',
    });

    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    expect(mockFetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
  });
});
