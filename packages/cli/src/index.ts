import { Command } from 'commander';
import { runInit, defineConfig } from './commands/init';
import { runPull } from './commands/pull';
import { runValidate } from './commands/validate';

const program = new Command();

program
  .name('huh')
  .description('CLI tool for managing error content from Google Sheets, Airtable, Notion, CSV, or XLSX')
  .version('0.1.0');

program
  .command('init')
  .description('Create a .huh.config.ts template in the current directory')
  .action(() => {
    runInit();
  });

program
  .command('pull')
  .description('Fetch error content from data source (Google Sheets, Airtable, Notion, CSV, or XLSX), parse, validate, and generate JSON')
  .action(async () => {
    await runPull();
  });

program
  .command('validate')
  .description('Validate an error content JSON file')
  .argument('[file]', 'Path to the JSON file (default: src/huh.json)')
  .action((file?: string) => {
    runValidate(file);
  });

program.parse();

export { defineConfig };
export type {
  HuhCliConfig,
  HuhSource,
  GoogleSheetsSource,
  AirtableSource,
  NotionSource,
  CsvSource,
  XlsxSource,
} from './commands/init';
