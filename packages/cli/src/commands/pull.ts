import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { parseSheetData, validateConfig } from '@huh/core';
import { getAdapter } from '../adapters';
import { generateJsonFile } from '../generate';
import type { HuhCliConfig } from './init';

const SOURCE_LABELS: Record<string, string> = {
  'google-sheets': 'Google Sheets',
  airtable: 'Airtable',
  notion: 'Notion',
  csv: 'CSV file',
  xlsx: 'XLSX file',
};

export async function runPull() {
  const configPath = path.resolve(process.cwd(), '.huh.config.ts');

  if (!fs.existsSync(configPath)) {
    console.error(pc.red('Config file not found. Run "huh init" first.'));
    process.exit(1);
  }

  // For simplicity in v0.1, read a JSON config variant
  // In production, we'd use tsx/jiti to load TS config
  let config: HuhCliConfig;
  try {
    const configJsonPath = configPath.replace('.ts', '.json');
    if (fs.existsSync(configJsonPath)) {
      config = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
    } else {
      console.error(
        pc.red(
          'Cannot load .huh.config.ts directly. ' +
            'Create a .huh.config.json with the same structure, or use a TS loader.',
        ),
      );
      process.exit(1);
      return;
    }
  } catch {
    console.error(pc.red('Failed to load config file'));
    process.exit(1);
    return;
  }

  const sourceLabel = SOURCE_LABELS[config.source.type] ?? config.source.type;
  console.log(pc.blue(`Fetching data from ${sourceLabel}...`));

  const adapter = getAdapter(config.source);
  const rows = await adapter.fetch(config.source);

  console.log(pc.blue(`Parsing ${rows.length - 1} rows...`));
  const errorConfig = parseSheetData(rows);

  const result = validateConfig(errorConfig);

  if (result.warnings.length > 0) {
    console.log(pc.yellow(`\n${result.warnings.length} warning(s):`));
    for (const w of result.warnings) {
      console.log(pc.yellow(`  - ${w.trackId ? `[${w.trackId}] ` : ''}${w.message}`));
    }
  }

  if (!result.valid) {
    console.error(pc.red(`\n${result.errors.length} error(s):`));
    for (const e of result.errors) {
      console.error(pc.red(`  - ${e.trackId ? `[${e.trackId}] ` : ''}${e.message}`));
    }
    process.exit(1);
  }

  const outputPath = path.resolve(process.cwd(), config.output);
  generateJsonFile(errorConfig, outputPath);

  const entryCount = Object.keys(errorConfig).length;
  console.log(pc.green(`\nGenerated ${outputPath} with ${entryCount} error entries.`));
}
