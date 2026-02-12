# @huh/cli API

A CLI tool that fetches error content from various data sources (Google Sheets, Airtable, Notion, CSV, XLSX) and converts it to a JSON file.

## Installation

```bash
pnpm add -D @huh/cli
```

After installation, you can use the `huh` command.

---

## Commands

### `huh init`

Creates a `.huh.config.ts` config file template in the current directory.

```bash
npx huh init
```

The generated file includes configuration examples for all 5 data sources: Google Sheets, Airtable, Notion, CSV, and XLSX. Uncomment the source you want to use.

If a config file already exists, it will not be overwritten and a warning will be displayed.

---

### `huh pull`

Fetches data from the configured data source and generates a JSON file.

```bash
npx huh pull
```

**Execution flow:**

1. Read config file (`.huh.config.json`)
2. Fetch data from configured data source via Adapter pattern
3. Convert to JSON DSL with `parseSheetData`
4. Validate with `validateConfig`
   - If only warnings, print them and continue
   - If errors exist, print errors and exit (exit code 1)
5. Generate JSON file at the specified output path

---

## Config File

The current v0.1 supports the `.huh.config.json` format.

### Google Sheets

```json
{
  "source": {
    "type": "google-sheets",
    "sheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    "range": "Sheet1"
  },
  "output": "./src/huh.json"
}
```

**Authentication:**

| Method | Configuration |
|--------|--------------|
| API Key (env var) | Set `GOOGLE_API_KEY` environment variable |
| API Key (config) | Specify directly in `source.apiKey` |
| Service Account | Specify JSON key file path in `source.credentials` |

```bash
GOOGLE_API_KEY=AIza... npx huh pull
```

For details: [Google Sheet Setup Guide](./google-sheet-guide.en.md)

### Airtable

```json
{
  "source": {
    "type": "airtable",
    "baseId": "appXXXXXXXXXXXXXX",
    "tableId": "tblYYYYYYYYYYYYYY"
  },
  "output": "./src/huh.json"
}
```

**Authentication:** `AIRTABLE_TOKEN` environment variable or specify directly in `source.token`

For details: [Airtable Integration Guide](./airtable-guide.en.md)

### Notion

```json
{
  "source": {
    "type": "notion",
    "databaseId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "output": "./src/huh.json"
}
```

**Authentication:** `NOTION_TOKEN` environment variable or specify directly in `source.token`

For details: [Notion Integration Guide](./notion-guide.en.md)

### CSV (Local File)

```json
{
  "source": {
    "type": "csv",
    "filePath": "./errors.csv"
  },
  "output": "./src/huh.json"
}
```

No authentication required. Uses an RFC 4180 compatible CSV parser.

For details: [CSV File Guide](./csv-guide.en.md)

### XLSX (Local File)

```json
{
  "source": {
    "type": "xlsx",
    "filePath": "./errors.xlsx",
    "sheet": "Sheet1"
  },
  "output": "./src/huh.json"
}
```

No authentication required. If `sheet` is not specified, the first sheet is used.

For details: [XLSX File Guide](./xlsx-guide.en.md)

---

### `huh validate [file]`

Validates a generated JSON file.

```bash
# Validate default path (src/huh.json)
npx huh validate

# Validate a specific file
npx huh validate ./path/to/errors.json
```

**Output example (success):**

```
Validating ./src/huh.json...
Found 5 error entries.

Validation passed!
```

**Output example (warnings + errors):**

```
Validating ./src/huh.json...
Found 3 error entries.

2 warning(s):
  - [ERR_TOAST] title: Toast errors typically do not display a title
  - [ERR_PAGE] action: Page errors should provide an action for user navigation

1 error(s):
  - [ERR_REDIRECT] action.target: Action type "REDIRECT" requires a target URL

Validation failed.
```

Exits with exit code 1 if there is at least one error. Passes if there are only warnings.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Huh Error Content Sync
on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays at 9 AM
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install

      - name: Pull error content
        run: npx huh pull
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
          # For Airtable: AIRTABLE_TOKEN: ${{ secrets.AIRTABLE_TOKEN }}
          # For Notion: NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}

      - name: Validate
        run: npx huh validate

      - name: Commit changes
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add src/huh.json
          git diff --staged --quiet || git commit -m "chore: sync error content"
          git push
```

### pre-commit Hook

```bash
# .husky/pre-commit
npx huh validate
```

---

## defineConfig

A helper function for type-safe configuration.

```ts
import { defineConfig } from '@huh/cli';
import type { HuhCliConfig } from '@huh/cli';
```

```ts
interface HuhCliConfig {
  source: HuhSource;
  output: string;  // JSON file output path
}

// Google Sheets
type GoogleSheetsSource = {
  type: 'google-sheets';
  sheetId: string;
  range?: string;       // Default: 'Sheet1'
  apiKey?: string;
  credentials?: string; // Service account JSON key file path
};

// Airtable
type AirtableSource = {
  type: 'airtable';
  baseId: string;
  tableId: string;
  token?: string;
};

// Notion
type NotionSource = {
  type: 'notion';
  databaseId: string;
  token?: string;
};

// CSV (local file)
type CsvSource = {
  type: 'csv';
  filePath: string;
};

// XLSX (local file)
type XlsxSource = {
  type: 'xlsx';
  filePath: string;
  sheet?: string;  // Uses first sheet if not specified
};

type HuhSource =
  | GoogleSheetsSource
  | AirtableSource
  | NotionSource
  | CsvSource
  | XlsxSource;
```
