# XLSX File Guide

Explains how to import error content from a local XLSX (Excel) file. Simple to use without any external API or authentication.

## Quick Start with Template

Download the pre-made XLSX template to get started right away. Includes both Korean and English sheets.

**[Download XLSX Template](https://github.com/your-org/huh/releases/latest/download/huh-template.xlsx)**

> After downloading, edit the data and run `huh pull`.

---

## 1. Writing an XLSX File

In Excel, create the first row as a header row:

| trackId | type | message | title | image | actionLabel | actionType | actionTarget |
|---------|------|---------|-------|-------|-------------|------------|--------------|
| ERR_LOGIN_FAILED | TOAST | Login failed | | | | | |
| ERR_SESSION_EXPIRED | MODAL | Session has expired | Session Expired | | Login Again | REDIRECT | /login |
| ERR_NOT_FOUND | PAGE | Page not found | 404 | /img/404.png | Go Home | REDIRECT | / |

> Even if entered in lowercase, the CLI will automatically convert to uppercase. Custom types (`BANNER`, `SNACKBAR`, etc.) can also be used freely.

### Column Rules

| Column Name | Required | Description |
|-------------|----------|-------------|
| `trackId` | Yes | Unique error ID (e.g., `ERR_LOGIN_FAILED`) |
| `type` | Yes | `TOAST`, `MODAL`, `PAGE`, or custom type |
| `message` | Yes | Error message. Supports `{{variable}}` template variables |
| `title` | | Error title (for modal, page) |
| `image` | | Image URL (for page) |
| `actionLabel` | | Action button text |
| `actionType` | | `REDIRECT`, `RETRY`, `BACK`, `DISMISS`, or custom action |
| `actionTarget` | | URL to navigate to for REDIRECT |

## 2. Configuration

### `.huh.config.json`

```json
{
  "source": {
    "type": "xlsx",
    "filePath": "./errors.xlsx"
  },
  "output": "./src/huh.json"
}
```

To specify a particular sheet, use the `sheet` option:

```json
{
  "source": {
    "type": "xlsx",
    "filePath": "./errors.xlsx",
    "sheet": "ErrorList"
  },
  "output": "./src/huh.json"
}
```

If `sheet` is not specified, the first sheet is used.

### `.huh.config.ts`

```ts
import { defineConfig } from '@huh/cli';

export default defineConfig({
  source: {
    type: 'xlsx',
    filePath: './errors.xlsx',
    // sheet: 'ErrorList',  // Optional: uses first sheet if not specified
  },
  output: './src/huh.json',
});
```

`filePath` can be a relative or absolute path. Relative paths are resolved from `process.cwd()`.

## 3. Fetching Data

```bash
huh pull
```

If successful, a JSON file will be generated at the `output` path.

## Notes

- Only `.xlsx` format is supported (legacy `.xls` format is not supported).
- The sheet must contain a header row + at least 1 data row.
- If the specified sheet name does not exist, an error will be shown along with the list of available sheets.
- Uses the [SheetJS](https://sheetjs.com/) library.
