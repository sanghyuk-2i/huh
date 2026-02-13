import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { parseSheetData, validateConfig, validateLocales } from '@huh/core';
import type { LocalizedErrorConfig } from '@huh/core';
import { getAdapter } from '../adapters';
import { generateJsonFile, generateLocaleFiles } from '../generate';
import type { HuhCliConfig, HuhSource } from './init';

const SOURCE_LABELS: Record<string, string> = {
  'google-sheets': 'Google Sheets',
  airtable: 'Airtable',
  notion: 'Notion',
  csv: 'CSV file',
  xlsx: 'XLSX file',
};

function getLocaleSource(
  base: HuhSource,
  override: {
    sheet?: string;
    range?: string;
    filePath?: string;
    tableId?: string;
    databaseId?: string;
  },
): HuhSource {
  if (override.filePath && (base.type === 'csv' || base.type === 'xlsx')) {
    return { ...base, filePath: override.filePath } as HuhSource;
  }
  if (override.sheet && base.type === 'xlsx') {
    return { ...base, sheet: override.sheet } as HuhSource;
  }
  if ((override.sheet || override.range) && base.type === 'google-sheets') {
    return { ...base, range: override.range ?? override.sheet } as HuhSource;
  }
  if (override.tableId && base.type === 'airtable') {
    return { ...base, tableId: override.tableId } as HuhSource;
  }
  if (override.databaseId && base.type === 'notion') {
    return { ...base, databaseId: override.databaseId } as HuhSource;
  }
  return base;
}

async function runPullSingle(config: HuhCliConfig) {
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

async function runPullI18n(config: HuhCliConfig) {
  const { i18n } = config;
  if (!i18n) return;

  const sourceLabel = SOURCE_LABELS[config.source.type] ?? config.source.type;
  const localeNames = Object.keys(i18n.locales);

  console.log(pc.blue(`i18n mode: ${localeNames.length} locales [${localeNames.join(', ')}]`));
  console.log(pc.blue(`Default locale: ${i18n.defaultLocale}`));

  if (!localeNames.includes(i18n.defaultLocale)) {
    console.error(pc.red(`Default locale "${i18n.defaultLocale}" is not in the locales list.`));
    process.exit(1);
  }

  const allLocaleConfigs: LocalizedErrorConfig = {};
  let hasErrors = false;

  for (const locale of localeNames) {
    const override = i18n.locales[locale];
    const localeSource = getLocaleSource(config.source, override);
    const adapter = getAdapter(localeSource);

    console.log(pc.blue(`\nFetching [${locale}] from ${sourceLabel}...`));
    const rows = await adapter.fetch(localeSource);

    console.log(pc.blue(`Parsing ${rows.length - 1} rows for [${locale}]...`));
    const errorConfig = parseSheetData(rows);

    // Per-locale validation
    const result = validateConfig(errorConfig);

    if (result.warnings.length > 0) {
      console.log(pc.yellow(`\n[${locale}] ${result.warnings.length} warning(s):`));
      for (const w of result.warnings) {
        console.log(pc.yellow(`  - ${w.trackId ? `[${w.trackId}] ` : ''}${w.message}`));
      }
    }

    if (!result.valid) {
      hasErrors = true;
      console.error(pc.red(`\n[${locale}] ${result.errors.length} error(s):`));
      for (const e of result.errors) {
        console.error(pc.red(`  - ${e.trackId ? `[${e.trackId}] ` : ''}${e.message}`));
      }
    }

    allLocaleConfigs[locale] = errorConfig;
  }

  if (hasErrors) {
    process.exit(1);
  }

  // Cross-locale validation
  const crossResult = validateLocales(allLocaleConfigs);

  if (crossResult.warnings.length > 0) {
    console.log(pc.yellow(`\nCross-locale ${crossResult.warnings.length} warning(s):`));
    for (const w of crossResult.warnings) {
      console.log(pc.yellow(`  - ${w.message}`));
    }
  }

  if (!crossResult.valid) {
    console.error(pc.red(`\nCross-locale ${crossResult.errors.length} error(s):`));
    for (const e of crossResult.errors) {
      console.error(pc.red(`  - ${e.message}`));
    }
    process.exit(1);
  }

  // Generate locale files
  const outputDir = path.resolve(process.cwd(), config.output);
  generateLocaleFiles(allLocaleConfigs, i18n.defaultLocale, outputDir);

  const totalEntries = Object.values(allLocaleConfigs).reduce(
    (sum, cfg) => sum + Object.keys(cfg).length,
    0,
  );
  console.log(
    pc.green(
      `\nGenerated ${localeNames.length} locale files in ${outputDir} (${totalEntries} total entries).`,
    ),
  );
}

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

  if (config.i18n) {
    await runPullI18n(config);
  } else {
    await runPullSingle(config);
  }
}
