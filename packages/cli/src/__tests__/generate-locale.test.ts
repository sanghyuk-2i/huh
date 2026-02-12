import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { generateLocaleFiles, generateLocaleIndex } from '../generate';
import type { LocalizedErrorConfig } from '@huh/core';

describe('generateLocaleFiles', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huh-locale-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates per-locale JSON files', () => {
    const locales: LocalizedErrorConfig = {
      ko: {
        ERR_AUTH: { type: 'MODAL', message: '인증 만료' },
      },
      en: {
        ERR_AUTH: { type: 'MODAL', message: 'Session expired' },
      },
    };

    generateLocaleFiles(locales, 'ko', tmpDir);

    const koPath = path.join(tmpDir, 'ko.json');
    const enPath = path.join(tmpDir, 'en.json');

    expect(fs.existsSync(koPath)).toBe(true);
    expect(fs.existsSync(enPath)).toBe(true);

    const koContent = JSON.parse(fs.readFileSync(koPath, 'utf-8'));
    expect(koContent.ERR_AUTH.message).toBe('인증 만료');

    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    expect(enContent.ERR_AUTH.message).toBe('Session expired');
  });

  it('creates index.ts barrel file', () => {
    const locales: LocalizedErrorConfig = {
      ko: { ERR_001: { type: 'TOAST', message: 'test' } },
      en: { ERR_001: { type: 'TOAST', message: 'test' } },
    };

    generateLocaleFiles(locales, 'ko', tmpDir);

    const indexPath = path.join(tmpDir, 'index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);

    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain("import ko from './ko.json'");
    expect(content).toContain("import en from './en.json'");
    expect(content).toContain("export type HuhLocale = 'ko' | 'en'");
    expect(content).toContain("export const defaultLocale: HuhLocale = 'ko'");
    expect(content).toContain('export const locales: Record<HuhLocale, ErrorConfig>');
  });

  it('creates output directory if it does not exist', () => {
    const locales: LocalizedErrorConfig = {
      ko: { ERR_001: { type: 'TOAST', message: 'test' } },
    };
    const nestedDir = path.join(tmpDir, 'nested', 'deep');

    generateLocaleFiles(locales, 'ko', nestedDir);

    expect(fs.existsSync(path.join(nestedDir, 'ko.json'))).toBe(true);
    expect(fs.existsSync(path.join(nestedDir, 'index.ts'))).toBe(true);
  });
});

describe('generateLocaleIndex', () => {
  it('generates correct TypeScript content', () => {
    const result = generateLocaleIndex(['ko', 'en', 'ja'], 'ko');

    expect(result).toContain("import ko from './ko.json'");
    expect(result).toContain("import en from './en.json'");
    expect(result).toContain("import ja from './ja.json'");
    expect(result).toContain("export type HuhLocale = 'ko' | 'en' | 'ja'");
    expect(result).toContain("export const defaultLocale: HuhLocale = 'ko'");
    expect(result).toContain('{ ko, en, ja }');
  });

  it('generates correct content for single locale', () => {
    const result = generateLocaleIndex(['en'], 'en');

    expect(result).toContain("export type HuhLocale = 'en'");
    expect(result).toContain("export const defaultLocale: HuhLocale = 'en'");
  });
});
