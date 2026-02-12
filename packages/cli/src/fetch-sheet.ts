import { google } from 'googleapis';

export interface FetchSheetOptions {
  sheetId: string;
  range?: string;
  apiKey?: string;
  credentials?: string;
}

export async function fetchSheetData(options: FetchSheetOptions): Promise<string[][]> {
  const { sheetId, range = 'Sheet1', apiKey, credentials } = options;

  let auth;
  if (credentials) {
    const keyFile = JSON.parse(
      await import('fs').then((fs) => fs.readFileSync(credentials, 'utf-8')),
    );
    auth = new google.auth.GoogleAuth({
      credentials: keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } else if (apiKey) {
    auth = apiKey;
  } else {
    throw new Error(
      'Either apiKey or credentials path must be provided. ' +
        'Set GOOGLE_API_KEY env variable or provide a service account credentials file.',
    );
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error('No data found in sheet');
  }

  return rows as string[][];
}
