import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import pc from 'picocolors';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
import type { TestCommandOptions, SimulateConfig } from '../test/types';
import { DEVICE_CONFIGS } from '../test/types';
import { filterTrackIds } from '../test/utils';
import { captureAllScreenshots } from '../test/screenshot';
import { generateReport } from '../test/report-generator';
import { loadPreviousReport, diffReports } from '../test/diff';
import type { HuhCliConfig } from './init';

export async function runTest(options: TestCommandOptions) {
  const configPath = path.resolve(process.cwd(), options.config);

  // Load error config JSON
  if (!fs.existsSync(configPath)) {
    console.error(pc.red(`Config file not found: ${configPath}`));
    process.exit(1);
  }

  let errorConfig: ErrorConfig;
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    errorConfig = JSON.parse(raw);
  } catch {
    console.error(pc.red(`Failed to parse config: ${configPath}`));
    process.exit(1);
    return;
  }

  // Load CLI config for simulate settings
  let simulate: SimulateConfig | undefined;
  const cliConfigJsonPath = path.resolve(process.cwd(), '.huh.config.json');
  if (fs.existsSync(cliConfigJsonPath)) {
    try {
      const cliConfig: HuhCliConfig = JSON.parse(fs.readFileSync(cliConfigJsonPath, 'utf-8'));
      simulate = cliConfig.simulate;
    } catch {
      // Ignore — simulate config is optional
    }
  }

  const device = DEVICE_CONFIGS[options.device];
  const entryCount = Object.keys(errorConfig).length;

  console.log(
    pc.blue(
      `\nhuh test — ${entryCount} entries, ${device.name} (${device.width}x${device.height})`,
    ),
  );
  console.log(pc.dim(`Mode: ${options.mode} | Config: ${configPath}\n`));

  // Filter trackIds
  const trackIds = filterTrackIds(errorConfig, options.filter, options.type);

  if (trackIds.length === 0) {
    console.log(pc.yellow('No entries match the filter criteria.'));
    return;
  }

  console.log(pc.blue(`Capturing ${trackIds.length} screenshots...`));

  // Load previous report for diff (before generating new one)
  const outputDir = path.resolve(process.cwd(), options.output);
  const previousReport = options.diff ? loadPreviousReport(outputDir) : null;

  // Capture screenshots
  const screenshots = await captureAllScreenshots({
    config: errorConfig,
    trackIds,
    device,
    simulate,
  });

  // Print progress
  const successCount = screenshots.filter((s) => s.success).length;
  const failCount = screenshots.filter((s) => !s.success).length;

  if (failCount > 0) {
    console.log(pc.yellow(`  ${successCount} captured, ${failCount} failed`));
  } else {
    console.log(pc.green(`  ${successCount} screenshots captured`));
  }

  // Generate report
  console.log(pc.blue('\nGenerating report...'));

  const reportData = generateReport({
    config: errorConfig,
    screenshots,
    device,
    mode: options.mode,
    outputDir,
  });

  const reportPath = path.join(outputDir, 'report.html');
  console.log(pc.green(`  Report: ${reportPath}`));
  console.log(pc.dim(`  Data:   ${path.join(outputDir, 'report-data.json')}`));

  // Summary
  console.log(
    `\n  ${pc.green(`${reportData.passCount} pass`)}  ${pc.red(`${reportData.failCount} fail`)}  ${pc.yellow(`${reportData.warningCount} warning`)}`,
  );

  // Diff
  if (options.diff && previousReport) {
    const diff = diffReports(previousReport, reportData);
    console.log(pc.blue(`\nDiff: ${diff.summary}`));

    for (const entry of diff.added) {
      console.log(pc.green(`  + ${entry.trackId}: ${entry.details}`));
    }
    for (const entry of diff.removed) {
      console.log(pc.red(`  - ${entry.trackId}: ${entry.details}`));
    }
    for (const entry of diff.changed) {
      console.log(pc.yellow(`  ~ ${entry.trackId}: ${entry.details}`));
    }
  } else if (options.diff) {
    console.log(pc.dim('\nNo previous report found for diff.'));
  }

  // Open in browser
  if (options.open) {
    openInBrowser(reportPath);
  }

  // CI mode: exit with code 1 if any failures
  if (options.ci && reportData.failCount > 0) {
    process.exit(1);
  }
}

function openInBrowser(filePath: string) {
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${cmd} "${filePath}"`);
}
