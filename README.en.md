<div align="center">

<br />

<img src="https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png" width="80" />

# Huh

**Error messages belong in a spreadsheet, not in your codebase.**

Non-developers manage error content in Google Sheets, Airtable, Notion, and more.
Developers get type-safe, auto-rendered error UI at runtime.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

[Getting Started](./docs/en/getting-started.mdx) | [API Reference](./docs/en/api/core.mdx) | [Architecture](./docs/en/architecture.mdx)

**[Korean / 한국어](./README.md)**

</div>

---

## The Problem

Every frontend team ends up with error messages scattered across the codebase. Product managers request copy changes, but they have to file tickets and wait for deploys. Error handling logic is duplicated across components. There's no single source of truth.

**Huh** fixes this by making an external data source the single source of truth for all error content:

```
Data Source (PM edits here) → huh pull → huh.json → Runtime UI
```

> Supports Google Sheets, Airtable, Notion, CSV, and XLSX.

## How It Works

```
 +-----------------+       +-------------+       +------------------+
 |  Data Source    | pull  |  huh.json   | build |   Your App       |
 |                 |------>|  (JSON DSL) |------>|                  |
 |  Managed by PM  |       |  Type-safe  |       |  Auto-render UI  |
 +-----------------+       +-------------+       +------------------+
```

> Data sources: Google Sheets · Airtable · Notion · CSV · XLSX

**Your data source looks like this:**

| trackId | type | message | title | action |
|---|---|---|---|---|
| ERR_NETWORK | toast | Network connection is unstable. | | |
| ERR_AUTH | modal | {{userName}}'s session has expired. | Session Expired | Login → redirect:/login |
| ERR_NOT_FOUND | page | The page you requested does not exist. | 404 | Go Back → back |

**Your code stays clean:**

```tsx
const { handleError } = useHuh();

// That's it. One line to show a fully-rendered error UI.
handleError('ERR_AUTH', { userName: 'Jane' });
```

## Quick Start

### 1. Install

```bash
# React
npm install @huh/core @huh/react

# Vue
npm install @huh/core @huh/vue

# Svelte
npm install @huh/core @huh/svelte
```

#### CDN (no bundler)

```html
<script src="https://unpkg.com/@huh/core"></script>
<!-- All APIs available via window.HuhCore -->
```

### 2. Pull error content from your data source

```bash
npx huh init          # Creates .huh.config.ts (choose your data source)
npx huh pull          # Fetches data source → generates huh.json
```

### 3. Wrap your app

```tsx
import errorContent from './huh.json';
import { HuhProvider, useHuh } from '@huh/react';

const renderers = {
  toast: ({ error, onDismiss }) => (
    <div className="toast" onClick={onDismiss}>{error.message}</div>
  ),
  modal: ({ error, onAction, onDismiss }) => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{error.title}</h2>
        <p>{error.message}</p>
        <button onClick={onAction}>{error.action?.label}</button>
        <button onClick={onDismiss}>Close</button>
      </div>
    </div>
  ),
  page: ({ error, onAction }) => (
    <div className="error-page">
      {error.image && <img src={error.image} />}
      <h1>{error.title}</h1>
      <p>{error.message}</p>
      <button onClick={onAction}>{error.action?.label}</button>
    </div>
  ),
};

function App() {
  return (
    <HuhProvider source={errorContent} renderers={renderers}>
      <MyPage />
    </HuhProvider>
  );
}
```

### 4. Handle errors anywhere

```tsx
function MyPage() {
  const { handleError } = useHuh();

  const fetchData = async () => {
    try {
      await api.getData();
    } catch (e) {
      handleError('ERR_FETCH_FAILED', { userName: 'Jane' });
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Features

### Template Variables

Use `{{variable}}` syntax in your sheet. Variables are resolved at runtime:

```
Sheet:  "Hello {{userName}}, {{count}} errors occurred."
Code:   handleError('ERR_BATCH', { userName: 'Jane', count: '3' })
Result: "Hello Jane, 3 errors occurred."
```

### Three Error Types

| Type | Use Case | Example |
|------|----------|---------|
| `toast` | Brief, non-blocking notifications | Network error, save failed |
| `modal` | Requires user acknowledgement | Auth expired, permission denied |
| `page` | Full-screen error states | 404, maintenance, fatal error |

### Automatic Action Handling

Define actions in the sheet. Huh handles the behavior automatically:

| Action Type | Behavior |
|---|---|
| `redirect` | Navigates to the specified URL |
| `retry` | Clears error and triggers `onRetry` callback |
| `back` | Calls `history.back()` |
| `dismiss` | Clears error |

### Build-Time Validation

```bash
npx huh validate

# ✓ 12 error entries loaded
# ⚠ WARN_TOAST_TITLE: toast type should not have a title
# ✗ ERR_REDIRECT: redirect action requires a target URL
```

Perfect for CI/CD pipelines. Catches content errors before they reach production.

## Packages

| Package | Description |
|---|---|
| [`@huh/core`](./packages/core) | Zero-dependency. Types, parsing, template engine, validation. **CDN ready.** |
| [`@huh/react`](./packages/react) | React bindings. `HuhProvider` + `useHuh` hook. |
| [`@huh/vue`](./packages/vue) | Vue 3 bindings. `HuhProvider` + `useHuh` composable. |
| [`@huh/svelte`](./packages/svelte) | Svelte 5 bindings. `HuhProvider` + `useHuh`. |
| [`@huh/cli`](./packages/cli) | `init` / `pull` / `validate` commands. |

`@huh/core` has **zero dependencies** and works in any JavaScript runtime. Use it standalone with vanilla JS or anything else.

## Why Huh?

| | Before (scattered) | After (Huh) |
|---|---|---|
| **Error copy** | Hardcoded in components | Managed in external data source |
| **Copy changes** | Requires code change + deploy | Sheet edit → `huh pull` |
| **Who can edit** | Only developers | Anyone with sheet access |
| **Consistency** | Different patterns per developer | One pattern, everywhere |
| **Type safety** | None | Full TypeScript support |
| **Validation** | None | Build-time + CI validation |

## Templates

Copy or download a template for your data source to get started quickly:

| Data Source | Template |
|---|---|
| Google Sheets | [Copy Template](https://docs.google.com/spreadsheets/d/TEMPLATE_SHEET_ID/copy) |
| Airtable | [Clone Template](https://airtable.com/TEMPLATE_BASE_ID) |
| Notion | [Duplicate Template](https://notion.so/TEMPLATE_DB_ID) |
| XLSX | [Download](https://github.com/your-org/huh/releases/latest/download/huh-template.xlsx) |
| CSV | [Korean](https://github.com/your-org/huh/releases/latest/download/huh-template-ko.csv) · [English](https://github.com/your-org/huh/releases/latest/download/huh-template-en.csv) |

## Documentation

- [Getting Started](./docs/en/getting-started.mdx) - Full setup guide
- [Google Sheet Setup](./docs/en/guides/google-sheets.mdx) · [Airtable](./docs/en/guides/airtable.mdx) · [Notion](./docs/en/guides/notion.mdx) · [CSV](./docs/en/guides/csv.mdx) · [XLSX](./docs/en/guides/xlsx.mdx)
- [@huh/core API](./docs/en/api/core.mdx) - `parseSheetData`, `resolveError`, `validateConfig`
- [@huh/react API](./docs/en/api/react.mdx) - `HuhProvider`, `useHuh`, renderer types
- [@huh/vue API](./docs/en/api/vue.mdx) - Vue 3 bindings
- [@huh/svelte API](./docs/en/api/svelte.mdx) - Svelte 5 bindings
- [@huh/cli API](./docs/en/api/cli.mdx) - CLI commands and config options
- [Architecture](./docs/en/architecture.mdx) - Design decisions and data flow

## CI/CD Integration

```yaml
# .github/workflows/sync-errors.yml
- name: Sync error content
  run: npx huh pull
  env:
    # Set the key for your data source
    GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}         # Google Sheets
    # AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}   # Airtable
    # NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}       # Notion

- name: Validate
  run: npx huh validate

- name: Commit changes
  run: |
    git add src/huh.json
    git commit -m "chore: sync error content" || true
```

## Contributing

```bash
git clone https://github.com/your-org/huh.git
cd huh
pnpm install
pnpm build
pnpm test
```

This monorepo uses [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces).

## License

[MIT](LICENSE)
