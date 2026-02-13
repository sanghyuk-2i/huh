# @sanghyuk-2i/huh-cli

CLI tool for **Huh** - Pull error content from Google Sheets, Airtable, Notion, CSV, or XLSX.

## Features

- 📊 **Multi-source Support**: Google Sheets, Airtable, Notion, CSV, XLSX
- ✅ **Validation**: Built-in schema validation with helpful errors
- 🌍 **i18n**: Multi-language error content management
- 🎨 **Visual Testing**: Screenshot testing with Playwright
- 🔄 **Watch Mode**: Auto-sync on file changes

## Installation

```bash
npm install -g @sanghyuk-2i/huh-cli
```

## Quick Start

```bash
# Initialize configuration
huh init

# Pull from data source
huh pull

# Visual testing (optional)
huh test
```

## Configuration

Create `.huh.config.json`:

```json
{
  "source": {
    "type": "google-sheets",
    "sheetId": "your-sheet-id",
    "range": "Sheet1!A1:Z"
  },
  "output": "src/huh.json"
}
```

## Supported Data Sources

### Google Sheets

```json
{
  "type": "google-sheets",
  "sheetId": "1abc...",
  "range": "Sheet1!A1:Z"
}
```

### Airtable

```json
{
  "type": "airtable",
  "baseId": "appXXX",
  "tableId": "tblXXX"
}
```

### Notion

```json
{
  "type": "notion",
  "databaseId": "xxx-xxx-xxx"
}
```

### CSV / XLSX

```json
{
  "type": "csv",
  "filePath": "./errors.csv"
}
```

## Multi-language Support

```json
{
  "source": { "type": "google-sheets", "sheetId": "..." },
  "output": "src/locales",
  "i18n": {
    "defaultLocale": "en",
    "locales": {
      "en": { "range": "English!A1:Z" },
      "ko": { "range": "Korean!A1:Z" }
    }
  }
}
```

## Documentation

- [CLI Reference](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/api/cli.mdx)
- [Data Source Guides](https://github.com/sanghyuk-2i/huh/tree/main/docs/en/guides)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
