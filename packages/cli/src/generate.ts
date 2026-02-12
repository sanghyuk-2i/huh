import * as fs from 'fs';
import * as path from 'path';
import type { ErrorConfig, LocalizedErrorConfig } from '@huh/core';

export function generateJsonFile(config: ErrorConfig, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(config, null, 2);
  fs.writeFileSync(outputPath, json + '\n', 'utf-8');
}

export function generateLocaleFiles(
  locales: LocalizedErrorConfig,
  defaultLocale: string,
  outputDir: string,
): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const localeNames = Object.keys(locales);

  // Write individual locale JSON files
  for (const locale of localeNames) {
    const filePath = path.join(outputDir, `${locale}.json`);
    const json = JSON.stringify(locales[locale], null, 2);
    fs.writeFileSync(filePath, json + '\n', 'utf-8');
  }

  // Generate index.ts barrel file
  const indexPath = path.join(outputDir, 'index.ts');
  const indexContent = generateLocaleIndex(localeNames, defaultLocale);
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
}

export function generateLocaleIndex(localeNames: string[], defaultLocale: string): string {
  const imports = localeNames
    .map((locale) => `import ${locale} from './${locale}.json';`)
    .join('\n');

  const unionType = localeNames.map((l) => `'${l}'`).join(' | ');
  const recordEntries = localeNames.join(', ');

  return `import type { ErrorConfig } from '@huh/core';
${imports}

export type HuhLocale = ${unionType};
export const defaultLocale: HuhLocale = '${defaultLocale}';
export const locales: Record<HuhLocale, ErrorConfig> = { ${recordEntries} };
`;
}
