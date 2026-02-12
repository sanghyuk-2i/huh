import { Command } from 'commander';
import { runInit, defineConfig } from './commands/init';
import { runPull } from './commands/pull';
import { runValidate } from './commands/validate';
import { runTest } from './commands/test';
import type { TestCommandOptions, DevicePreset } from './test/types';

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

program
  .command('test')
  .description('Capture screenshots of all error UIs and generate an HTML report')
  .option('--mode <mode>', 'Preview mode: standalone or app', 'standalone')
  .option('--url <url>', 'App URL (required for app mode)')
  .option('--config <path>', 'Path to huh.json', 'src/huh.json')
  .option('--output <dir>', 'Report output directory', '.huh-report')
  .option('--filter <ids>', 'Filter by trackId (comma-separated)')
  .option('--type <types>', 'Filter by error type (comma-separated)')
  .option('--device <preset>', 'Device preset: desktop, mobile, tablet', 'desktop')
  .option('--open', 'Open report in browser after generation', false)
  .option('--ci', 'CI mode: exit with code 1 on failures', false)
  .option('--diff', 'Compare with previous report', false)
  .action(async (opts) => {
    const options: TestCommandOptions = {
      mode: opts.mode as 'standalone' | 'app',
      url: opts.url,
      config: opts.config,
      output: opts.output,
      filter: opts.filter,
      type: opts.type,
      device: opts.device as DevicePreset,
      open: opts.open,
      ci: opts.ci,
      diff: opts.diff,
    };
    await runTest(options);
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
