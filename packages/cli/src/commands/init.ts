import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';

const CONFIG_TEMPLATE = `import { defineConfig } from '@huh/cli';

export default defineConfig({
  // === Google Sheets ===
  source: {
    type: 'google-sheets',
    sheetId: 'YOUR_GOOGLE_SHEET_ID',
    range: 'Sheet1',
    // Either set GOOGLE_API_KEY env variable or provide credentials path:
    // apiKey: process.env.GOOGLE_API_KEY,
    // credentials: './service-account.json',
  },

  // === Airtable ===
  // source: {
  //   type: 'airtable',
  //   baseId: 'YOUR_AIRTABLE_BASE_ID',
  //   tableId: 'YOUR_TABLE_ID',
  //   // Set AIRTABLE_TOKEN env variable or provide token directly:
  //   // token: process.env.AIRTABLE_TOKEN,
  // },

  // === Notion ===
  // source: {
  //   type: 'notion',
  //   databaseId: 'YOUR_NOTION_DATABASE_ID',
  //   // Set NOTION_TOKEN env variable or provide token directly:
  //   // token: process.env.NOTION_TOKEN,
  // },

  // === CSV (local file) ===
  // source: {
  //   type: 'csv',
  //   filePath: './errors.csv',
  // },

  // === XLSX (local file) ===
  // source: {
  //   type: 'xlsx',
  //   filePath: './errors.xlsx',
  //   // sheet: 'Sheet1',  // optional, defaults to first sheet
  // },

  output: './src/huh.json',
});
`;

export function runInit() {
  const configPath = path.resolve(process.cwd(), '.huh.config.ts');

  if (fs.existsSync(configPath)) {
    console.log(pc.yellow('Config file already exists: .huh.config.ts'));
    return;
  }

  fs.writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8');
  console.log(pc.green('Created .huh.config.ts'));
  console.log(pc.dim('Edit the config file to set your data source (Google Sheets, Airtable, Notion, CSV, or XLSX) and output path.'));
}

// Source type definitions
export interface GoogleSheetsSource {
  type: 'google-sheets';
  sheetId: string;
  range?: string;
  apiKey?: string;
  credentials?: string;
}

export interface AirtableSource {
  type: 'airtable';
  baseId: string;
  tableId: string;
  token?: string;
}

export interface NotionSource {
  type: 'notion';
  databaseId: string;
  token?: string;
}

export interface CsvSource {
  type: 'csv';
  filePath: string;
}

export interface XlsxSource {
  type: 'xlsx';
  filePath: string;
  sheet?: string;
}

export type HuhSource = GoogleSheetsSource | AirtableSource | NotionSource | CsvSource | XlsxSource;

// Simple defineConfig helper for type-safe config
export interface HuhCliConfig {
  source: HuhSource;
  output: string;
  simulate?: {
    variables?: Record<string, Record<string, string>>;
    defaultVariables?: Record<string, string>;
    waitTimeout?: number;
    screenshotDelay?: number;
  };
}

export function defineConfig(config: HuhCliConfig): HuhCliConfig {
  return config;
}
