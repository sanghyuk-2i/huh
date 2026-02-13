import * as fs from 'fs';
import * as path from 'path';
import { google, type sheets_v4 } from 'googleapis';
import {
  HEADERS,
  SAMPLE_KO,
  SAMPLE_EN,
  toRows,
  TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
} from './data.js';

function getAuth() {
  const value = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!value) return null;

  let credentials: Record<string, unknown>;

  if (value.trim().startsWith('{')) {
    // Raw JSON string (GitHub Actions secrets)
    credentials = JSON.parse(value);
  } else if (fs.existsSync(path.resolve(value))) {
    // File path (local development)
    credentials = JSON.parse(fs.readFileSync(path.resolve(value), 'utf-8'));
  } else {
    // Base64 encoded JSON
    credentials = JSON.parse(Buffer.from(value, 'base64').toString('utf-8'));
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function buildHeaderStyle(): sheets_v4.Schema$CellFormat {
  return {
    textFormat: { bold: true },
    backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
  };
}

function buildDataValidation(
  sheetId: number,
  columnIndex: number,
  values: readonly string[],
  rowCount: number,
): sheets_v4.Schema$Request {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: rowCount + 1,
        startColumnIndex: columnIndex,
        endColumnIndex: columnIndex + 1,
      },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: values.map((v) => ({ userEnteredValue: v })),
        },
        showCustomUi: true,
        strict: true,
      },
    },
  };
}

function buildSheetRequests(
  sheetId: number,
  rows: string[][],
): sheets_v4.Schema$Request[] {
  const headerRow = rows[0];
  const typeColIndex = headerRow.indexOf('type');
  const severityColIndex = headerRow.indexOf('severity');
  const actionTypeColIndex = headerRow.indexOf('actionType');
  const dataRowCount = rows.length - 1;

  const requests: sheets_v4.Schema$Request[] = [];

  // Header bold + background
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: headerRow.length,
      },
      cell: { userEnteredFormat: buildHeaderStyle() },
      fields: 'userEnteredFormat(textFormat,backgroundColor)',
    },
  });

  // Freeze first row
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        gridProperties: { frozenRowCount: 1 },
      },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // Auto-resize columns
  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: 0,
        endIndex: headerRow.length,
      },
    },
  });

  // Data validation for type column
  if (typeColIndex !== -1) {
    requests.push(
      buildDataValidation(sheetId, typeColIndex, TYPE_OPTIONS, dataRowCount),
    );
  }

  // Data validation for severity column
  if (severityColIndex !== -1) {
    requests.push(
      buildDataValidation(sheetId, severityColIndex, SEVERITY_OPTIONS, dataRowCount),
    );
  }

  // Data validation for actionType column
  if (actionTypeColIndex !== -1) {
    requests.push(
      buildDataValidation(sheetId, actionTypeColIndex, ACTION_TYPE_OPTIONS, dataRowCount),
    );
  }

  return requests;
}

export interface GoogleSheetsResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  copyUrl: string;
}

export async function generateGoogleSheets(): Promise<GoogleSheetsResult | null> {
  const auth = getAuth();
  if (!auth) return null;

  const sheets = google.sheets({ version: 'v4', auth });
  const existingId = process.env.GOOGLE_SHEET_ID;

  const koRows = toRows(SAMPLE_KO);
  const enRows = toRows(SAMPLE_EN);

  let spreadsheetId: string;

  if (existingId) {
    spreadsheetId = existingId;

    // Get existing sheet info
    const info = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = info.data.sheets ?? [];

    // Clear and update existing sheets, or create new ones
    const sheetConfigs = [
      { title: '한국어', rows: koRows },
      { title: 'English', rows: enRows },
    ];

    for (const config of sheetConfigs) {
      const existing = existingSheets.find(
        (s) => s.properties?.title === config.title,
      );

      if (existing) {
        // Clear existing data
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `'${config.title}'`,
        });

        // Write new data
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${config.title}'!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: config.rows },
        });
      } else {
        // Add new sheet
        const addRes = await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: config.title } } }],
          },
        });
        const newSheetId =
          addRes.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${config.title}'!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: config.rows },
        });

        // Apply formatting
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: buildSheetRequests(newSheetId, config.rows),
          },
        });
      }
    }

    // Apply formatting to existing sheets
    const updatedInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const allRequests: sheets_v4.Schema$Request[] = [];

    for (const config of sheetConfigs) {
      const sheet = updatedInfo.data.sheets?.find(
        (s) => s.properties?.title === config.title,
      );
      if (sheet?.properties?.sheetId != null) {
        allRequests.push(
          ...buildSheetRequests(sheet.properties.sheetId, config.rows),
        );
      }
    }

    if (allRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: allRequests },
      });
    }
  } else {
    // Create new spreadsheet
    const res = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'Huh Error Template' },
        sheets: [
          { properties: { title: '한국어', sheetId: 0 } },
          { properties: { title: 'English', sheetId: 1 } },
        ],
      },
    });

    spreadsheetId = res.data.spreadsheetId!;

    // Write data to both sheets
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          { range: "'한국어'!A1", values: koRows },
          { range: "'English'!A1", values: enRows },
        ],
      },
    });

    // Apply formatting
    const allRequests = [
      ...buildSheetRequests(0, koRows),
      ...buildSheetRequests(1, enRows),
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: allRequests },
    });

    // Share: anyone with link can view
    const drive = google.drive({ version: 'v3', auth });
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: { role: 'reader', type: 'anyone' },
    });
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  const copyUrl = `${spreadsheetUrl}/copy`;

  return { spreadsheetId, spreadsheetUrl, copyUrl };
}
