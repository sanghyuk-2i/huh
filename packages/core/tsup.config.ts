import { defineConfig } from 'tsup';

export default defineConfig([
  // 기존 CJS + ESM 빌드
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    metafile: true,
  },
  // CDN용 IIFE 빌드 (신규)
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'HuhCore',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true,
    outExtension: () => ({ js: '.global.js' }),
  },
]);
