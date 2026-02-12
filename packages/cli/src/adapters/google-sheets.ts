import type { GoogleSheetsSource } from '../commands/init';
import { fetchSheetData } from '../fetch-sheet';
import { registerAdapter } from './registry';
import type { SourceAdapter } from './types';

const googleSheetsAdapter: SourceAdapter<GoogleSheetsSource> = {
  type: 'google-sheets',
  async fetch(source) {
    return fetchSheetData({
      sheetId: source.sheetId,
      range: source.range,
      apiKey: source.apiKey ?? process.env.GOOGLE_API_KEY,
      credentials: source.credentials,
    });
  },
};

registerAdapter(googleSheetsAdapter);
