# CSV File Guide

Explains how to import error content from a local CSV file. Simple to use without any external API or authentication.

## Quick Start with Template

Download the pre-made CSV template to get started right away.

- [Download Korean CSV Template](https://github.com/your-org/huh/releases/latest/download/huh-template-ko.csv)
- [Download English CSV Template](https://github.com/your-org/huh/releases/latest/download/huh-template-en.csv)

> After downloading, edit the data and run `huh pull`.

---

## 1. Writing a CSV File

The first row must be a header row. Follow the column structure below:

```csv
trackId,type,message,title,image,actionLabel,actionType,actionTarget
ERR_LOGIN_FAILED,TOAST,Login failed,,,,,
ERR_SESSION_EXPIRED,MODAL,Session has expired,Session Expired,,Login Again,REDIRECT,/login
ERR_NOT_FOUND,PAGE,Page not found,404,/img/404.png,Go Home,REDIRECT,/
```

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

### CSV Format Support

Uses an RFC 4180 compatible parser, supporting:

- Quoted fields: `"Hello, World"`
- Escaped quotes within fields: `"say ""hello"""`
- Newlines within fields (must be quoted)
- CRLF (`\r\n`) and LF (`\n`) line endings
- Automatic UTF-8 BOM removal

## 2. Configuration

### `.huh.config.json`

```json
{
  "source": {
    "type": "csv",
    "filePath": "./errors.csv"
  },
  "output": "./src/huh.json"
}
```

### `.huh.config.ts`

```ts
import { defineConfig } from '@huh/cli';

export default defineConfig({
  source: {
    type: 'csv',
    filePath: './errors.csv',
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

- The CSV file must contain a header row + at least 1 data row.
- Uses a built-in parser with no additional dependencies.
- Files exported as CSV from Excel can be used directly.
