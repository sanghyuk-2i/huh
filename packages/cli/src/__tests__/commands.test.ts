import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { generateJsonFile } from '../generate';

describe('generateJsonFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a JSON file with correct content', () => {
    const config = {
      ERR_001: { type: 'TOAST', message: 'Test error' },
    };
    const outputPath = path.join(tmpDir, 'output.json');

    generateJsonFile(config, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    expect(content).toEqual(config);
  });

  it('creates nested directories if needed', () => {
    const config = {
      ERR_001: { type: 'TOAST', message: 'Test' },
    };
    const outputPath = path.join(tmpDir, 'nested', 'deep', 'output.json');

    generateJsonFile(config, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);
  });
});

describe('init command', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-init-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates config template file', async () => {
    const { runInit } = await import('../commands/init');
    runInit();

    const configPath = path.join(tmpDir, '.huh.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain('defineConfig');
    expect(content).toContain('YOUR_GOOGLE_SHEET_ID');
  });

  it('does not overwrite existing config', async () => {
    const configPath = path.join(tmpDir, '.huh.config.ts');
    fs.writeFileSync(configPath, 'existing content', 'utf-8');

    const { runInit } = await import('../commands/init');
    runInit();

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toBe('existing content');
  });
});

describe('validate command', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-validate-'));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('validates a correct JSON file', async () => {
    const config = {
      ERR_001: { type: 'TOAST', message: 'Test error' },
    };
    const jsonPath = path.join(tmpDir, 'errors.json');
    fs.writeFileSync(jsonPath, JSON.stringify(config), 'utf-8');

    // runValidate calls process.exit on failure, so we mock it
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    const { runValidate } = await import('../commands/validate');
    runValidate('errors.json');

    expect(mockExit).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });
});

// Need vi import for the validate test
import { vi } from 'vitest';
