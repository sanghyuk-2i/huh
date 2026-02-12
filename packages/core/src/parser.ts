import type { ErrorConfig, ErrorAction } from './schema';

/**
 * Expected sheet columns (header row):
 * trackId | type | message | title | image | actionLabel | actionType | actionTarget
 */
const EXPECTED_HEADERS = [
  'trackId',
  'type',
  'message',
  'title',
  'image',
  'actionLabel',
  'actionType',
  'actionTarget',
];

export function parseSheetData(rows: string[][]): ErrorConfig {
  if (rows.length < 2) {
    throw new Error('Sheet data must contain at least a header row and one data row');
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => h.trim());

  const colIndex: Record<string, number> = {};
  for (const key of EXPECTED_HEADERS) {
    const idx = headers.indexOf(key);
    if (idx !== -1) {
      colIndex[key] = idx;
    }
  }

  if (!('trackId' in colIndex)) {
    throw new Error('Missing required column: trackId');
  }
  if (!('type' in colIndex)) {
    throw new Error('Missing required column: type');
  }
  if (!('message' in colIndex)) {
    throw new Error('Missing required column: message');
  }

  const config: ErrorConfig = {};

  for (const row of dataRows) {
    const get = (key: string): string => {
      const idx = colIndex[key];
      return idx !== undefined && idx < row.length ? row[idx].trim() : '';
    };

    const trackId = get('trackId');
    if (!trackId) continue;

    const rawType = get('type');
    if (!rawType) {
      throw new Error(`Missing type for trackId "${trackId}"`);
    }

    // Normalize type to uppercase for consistent handling
    const type = rawType.toUpperCase();

    const message = get('message');
    if (!message) {
      throw new Error(`Missing message for trackId "${trackId}"`);
    }

    let action: ErrorAction | undefined;
    const actionLabel = get('actionLabel');
    const rawActionType = get('actionType');

    if (actionLabel && rawActionType) {
      // Normalize action type to uppercase
      action = {
        label: actionLabel,
        type: rawActionType.toUpperCase(),
      };
      const actionTarget = get('actionTarget');
      if (actionTarget) {
        action.target = actionTarget;
      }
    }

    config[trackId] = {
      type,
      message,
      ...(get('title') && { title: get('title') }),
      ...(get('image') && { image: get('image') }),
      ...(action && { action }),
    };
  }

  return config;
}
