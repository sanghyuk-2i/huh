import 'dotenv/config';
import pc from 'picocolors';
import { generateCsv } from './src/generate-csv.js';
import { generateXlsx } from './src/generate-xlsx.js';
import { generateGoogleSheets } from './src/generate-google-sheets.js';
import { generateAirtable } from './src/generate-airtable.js';
import { generateNotion } from './src/generate-notion.js';

type Platform = 'csv' | 'xlsx' | 'google-sheets' | 'airtable' | 'notion';

const ALL_PLATFORMS: Platform[] = ['csv', 'xlsx', 'google-sheets', 'airtable', 'notion'];

function parsePlatforms(args: string[]): Platform[] {
  const idx = args.indexOf('--platform');
  if (idx === -1 || idx + 1 >= args.length) return ALL_PLATFORMS;

  const value = args[idx + 1];
  if (value === 'all') return ALL_PLATFORMS;

  const platforms = value.split(',').map((p) => p.trim()) as Platform[];
  const invalid = platforms.filter((p) => !ALL_PLATFORMS.includes(p));
  if (invalid.length > 0) {
    console.error(pc.red(`Unknown platforms: ${invalid.join(', ')}`));
    console.error(`Valid platforms: ${ALL_PLATFORMS.join(', ')}`);
    process.exit(1);
  }

  return platforms;
}

async function main() {
  const platforms = parsePlatforms(process.argv.slice(2));

  console.log(pc.bold('\nHuh Template Generator'));
  console.log(pc.dim(`Platforms: ${platforms.join(', ')}\n`));

  const results: string[] = [];

  // CSV
  if (platforms.includes('csv')) {
    console.log(pc.cyan('CSV'));
    try {
      const res = await generateCsv();
      results.push(`CSV (KO): ${res.koPath}`);
      results.push(`CSV (EN): ${res.enPath}`);
      console.log(pc.green('  OK'));
    } catch (err) {
      console.log(pc.red(`  FAIL: ${err}`));
    }
  }

  // XLSX
  if (platforms.includes('xlsx')) {
    console.log(pc.cyan('XLSX'));
    try {
      const res = await generateXlsx();
      results.push(`XLSX: ${res.filePath}`);
      console.log(pc.green('  OK'));
    } catch (err) {
      console.log(pc.red(`  FAIL: ${err}`));
    }
  }

  // Google Sheets
  if (platforms.includes('google-sheets')) {
    console.log(pc.cyan('Google Sheets'));
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log(pc.yellow('  SKIP: GOOGLE_SERVICE_ACCOUNT_KEY not set'));
    } else {
      try {
        const res = await generateGoogleSheets();
        if (res) {
          results.push(`Google Sheets: ${res.copyUrl}`);
          console.log(pc.green('  OK'));
          console.log(pc.dim(`  Copy URL: ${res.copyUrl}`));
          console.log(pc.dim(`  Sheet ID: ${res.spreadsheetId}`));
        }
      } catch (err) {
        console.log(pc.red(`  FAIL: ${err}`));
      }
    }
  }

  // Airtable
  if (platforms.includes('airtable')) {
    console.log(pc.cyan('Airtable'));
    if (!process.env.AIRTABLE_TOKEN) {
      console.log(pc.yellow('  SKIP: AIRTABLE_TOKEN not set'));
    } else {
      try {
        const res = await generateAirtable();
        if (res) {
          results.push(`Airtable: ${res.baseUrl}`);
          console.log(pc.green('  OK'));
          console.log(pc.dim(`  Base URL: ${res.baseUrl}`));
          console.log(pc.dim(`  Base ID: ${res.baseId}`));
        }
      } catch (err) {
        console.log(pc.red(`  FAIL: ${err}`));
      }
    }
  }

  // Notion
  if (platforms.includes('notion')) {
    console.log(pc.cyan('Notion'));
    if (!process.env.NOTION_TOKEN) {
      console.log(pc.yellow('  SKIP: NOTION_TOKEN not set'));
    } else {
      try {
        const res = await generateNotion();
        if (res) {
          results.push(`Notion (KO): ${res.koDatabaseUrl}`);
          results.push(`Notion (EN): ${res.enDatabaseUrl}`);
          console.log(pc.green('  OK'));
          console.log(pc.dim(`  KO DB: ${res.koDatabaseUrl}`));
          console.log(pc.dim(`  EN DB: ${res.enDatabaseUrl}`));
        }
      } catch (err) {
        console.log(pc.red(`  FAIL: ${err}`));
      }
    }
  }

  // Summary
  console.log(pc.bold('\nSummary'));
  if (results.length === 0) {
    console.log(pc.yellow('  No templates were generated.'));
  } else {
    for (const r of results) {
      console.log(pc.green(`  ${r}`));
    }
  }

  console.log('');
}

main().catch((err) => {
  console.error(pc.red(err));
  process.exit(1);
});
