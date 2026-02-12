import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/core',
  'packages/react',
  'packages/vue',
  'packages/svelte',
  'packages/cli',
  'packages/plugin-sentry',
  'packages/plugin-datadog',
]);
