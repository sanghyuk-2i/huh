# @sanghyuk-2i/huh-core

Core library for **Huh** - Manage error content in spreadsheets with type-safe runtime UI rendering.

## Features

- 📋 **JSON DSL**: Parse error content from external data sources
- 🔄 **Variable Substitution**: Dynamic content with template variables
- ✅ **Validation**: Built-in schema validation with helpful error messages
- 🌍 **i18n Support**: Multi-language error content management
- 🔌 **Plugin System**: Extend with Sentry, Datadog, and custom integrations
- 📊 **Severity Levels**: Critical, high, medium, low error classification

## Installation

```bash
npm install @sanghyuk-2i/huh-core
```

## Basic Usage

```typescript
import { parseSheetData, resolveError } from '@sanghyuk-2i/huh-core';

// Parse error configuration from data source
const errorConfig = parseSheetData(rows);

// Resolve error with variables
const resolved = resolveError(
  errorConfig,
  'AUTH_001',
  { username: 'john' }
);

console.log(resolved.message); // "User john not found"
```

## Framework Bindings

Use framework-specific packages for easier integration:

- **React**: `@sanghyuk-2i/huh-react`
- **Vue**: `@sanghyuk-2i/huh-vue`
- **Svelte**: `@sanghyuk-2i/huh-svelte`

## Documentation

- [Getting Started](https://github.com/sanghyuk-2i/huh#readme)
- [Architecture](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/architecture.mdx)
- [API Reference](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/api/core.mdx)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
