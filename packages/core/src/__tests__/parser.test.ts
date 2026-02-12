import { describe, it, expect } from 'vitest';
import { parseSheetData } from '../parser';

const HEADERS = ['trackId', 'type', 'message', 'title', 'image', 'actionLabel', 'actionType', 'actionTarget'];

describe('parseSheetData', () => {
  it('parses a basic toast entry and normalizes type to uppercase', () => {
    const rows = [
      HEADERS,
      ['ERR_001', 'toast', 'Something went wrong', '', '', '', '', ''],
    ];
    const config = parseSheetData(rows);
    expect(config).toEqual({
      ERR_001: {
        type: 'TOAST',
        message: 'Something went wrong',
      },
    });
  });

  it('parses a modal entry with action', () => {
    const rows = [
      HEADERS,
      ['ERR_002', 'modal', 'Session expired', 'Oops!', '', 'Login again', 'redirect', '/login'],
    ];
    const config = parseSheetData(rows);
    expect(config).toEqual({
      ERR_002: {
        type: 'MODAL',
        message: 'Session expired',
        title: 'Oops!',
        action: {
          label: 'Login again',
          type: 'REDIRECT',
          target: '/login',
        },
      },
    });
  });

  it('parses a page entry with image', () => {
    const rows = [
      HEADERS,
      ['ERR_003', 'page', 'Page not found', '404', 'https://img.com/404.png', 'Go home', 'redirect', '/'],
    ];
    const config = parseSheetData(rows);
    expect(config.ERR_003.image).toBe('https://img.com/404.png');
    expect(config.ERR_003.title).toBe('404');
    expect(config.ERR_003.type).toBe('PAGE');
  });

  it('parses multiple entries', () => {
    const rows = [
      HEADERS,
      ['ERR_001', 'toast', 'Error 1', '', '', '', '', ''],
      ['ERR_002', 'modal', 'Error 2', 'Title', '', '', '', ''],
    ];
    const config = parseSheetData(rows);
    expect(Object.keys(config)).toEqual(['ERR_001', 'ERR_002']);
  });

  it('skips rows with empty trackId', () => {
    const rows = [
      HEADERS,
      ['', 'toast', 'Ignored', '', '', '', '', ''],
      ['ERR_001', 'toast', 'Kept', '', '', '', '', ''],
    ];
    const config = parseSheetData(rows);
    expect(Object.keys(config)).toEqual(['ERR_001']);
  });

  it('throws on missing header row', () => {
    expect(() => parseSheetData([['ERR_001']])).toThrow('at least a header row');
  });

  it('throws on missing required columns', () => {
    expect(() => parseSheetData([['id', 'msg'], ['ERR_001', 'test']])).toThrow(
      'Missing required column: trackId',
    );
  });

  it('throws on empty type', () => {
    const rows = [
      HEADERS,
      ['ERR_001', '', 'Oops', '', '', '', '', ''],
    ];
    expect(() => parseSheetData(rows)).toThrow('Missing type for trackId "ERR_001"');
  });

  it('preserves template variables in message', () => {
    const rows = [
      HEADERS,
      ['ERR_001', 'toast', 'Hello, {{userName}}!', '', '', '', '', ''],
    ];
    const config = parseSheetData(rows);
    expect(config.ERR_001.message).toBe('Hello, {{userName}}!');
  });

  it('accepts custom types and normalizes to uppercase', () => {
    const rows = [
      HEADERS,
      ['ERR_001', 'banner', 'Custom banner error', '', '', '', '', ''],
      ['ERR_002', 'SNACKBAR', 'Custom snackbar', '', '', 'Undo', 'undo_action', ''],
    ];
    const config = parseSheetData(rows);
    expect(config.ERR_001.type).toBe('BANNER');
    expect(config.ERR_002.type).toBe('SNACKBAR');
    expect(config.ERR_002.action?.type).toBe('UNDO_ACTION');
  });

  it('normalizes action types to uppercase', () => {
    const rows = [
      HEADERS,
      ['ERR_001', 'modal', 'Test', '', '', 'Go', 'Redirect', '/home'],
    ];
    const config = parseSheetData(rows);
    expect(config.ERR_001.action?.type).toBe('REDIRECT');
  });
});
