import * as fs from 'fs';
import * as path from 'path';
import type { ErrorConfig } from '@huh/core';

export function generateJsonFile(config: ErrorConfig, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(config, null, 2);
  fs.writeFileSync(outputPath, json + '\n', 'utf-8');
}
