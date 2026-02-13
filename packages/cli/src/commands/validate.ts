import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { validateConfig } from '@sanghyuk-2i/huh-core';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';

export function runValidate(filePath?: string) {
  const targetPath = filePath
    ? path.resolve(process.cwd(), filePath)
    : path.resolve(process.cwd(), 'src/huh.json');

  if (!fs.existsSync(targetPath)) {
    console.error(pc.red(`File not found: ${targetPath}`));
    process.exit(1);
  }

  let config: ErrorConfig;
  try {
    const raw = fs.readFileSync(targetPath, 'utf-8');
    config = JSON.parse(raw);
  } catch {
    console.error(pc.red(`Failed to parse JSON file: ${targetPath}`));
    process.exit(1);
    return;
  }

  console.log(pc.blue(`Validating ${targetPath}...`));

  const result = validateConfig(config);
  const entryCount = Object.keys(config).length;

  // Severity distribution summary
  const severityCounts: Record<string, number> = {};
  for (const entry of Object.values(config)) {
    const sev = entry.severity ?? '(none)';
    severityCounts[sev] = (severityCounts[sev] ?? 0) + 1;
  }
  const severitySummary = Object.entries(severityCounts)
    .map(([sev, count]) => `${sev}: ${count}`)
    .join(', ');

  console.log(pc.dim(`Found ${entryCount} error entries.`));
  console.log(pc.dim(`Severity: ${severitySummary}\n`));

  if (result.warnings.length > 0) {
    console.log(pc.yellow(`${result.warnings.length} warning(s):`));
    for (const w of result.warnings) {
      console.log(pc.yellow(`  - ${w.trackId ? `[${w.trackId}] ` : ''}${w.message}`));
    }
    console.log();
  }

  if (result.errors.length > 0) {
    console.error(pc.red(`${result.errors.length} error(s):`));
    for (const e of result.errors) {
      console.error(pc.red(`  - [${e.trackId}] ${e.field ? `${e.field}: ` : ''}${e.message}`));
    }
    console.log();
  }

  if (result.valid) {
    console.log(pc.green('Validation passed!'));
  } else {
    console.error(pc.red('Validation failed.'));
    process.exit(1);
  }
}
