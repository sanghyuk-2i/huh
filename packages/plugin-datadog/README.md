# @sanghyuk-2i/huh-plugin-datadog

Datadog integration plugin for **Huh** - Automatic error logging and action tracking.

## Features

- 📊 **Auto Error Logging**: Automatically log errors to Datadog
- 📈 **Custom Metrics**: Track error frequency and patterns
- 🏷️ **Tags & Attributes**: Rich error context
- ⚙️ **Configurable**: Filter errors, customize attributes

## Installation

```bash
npm install @sanghyuk-2i/huh-plugin-datadog @sanghyuk-2i/huh-core @datadog/browser-logs
```

## Usage

```typescript
import { datadogLogs } from '@datadog/browser-logs';
import { createDatadogPlugin } from '@sanghyuk-2i/huh-plugin-datadog';

// Initialize Datadog
datadogLogs.init({
  clientToken: 'your-client-token',
  site: 'datadoghq.com',
  service: 'your-app',
  env: 'production'
});

// Create plugin
const datadogPlugin = createDatadogPlugin({
  logErrors: true,
  beforeLog: (error) => {
    // Filter or modify before logging
    return error.severity !== 'low';
  }
});

// Use with framework bindings
import { HuhProvider } from '@sanghyuk-2i/huh-react';

<HuhProvider config={errorConfig} plugins={[datadogPlugin]}>
  <App />
</HuhProvider>
```

## Configuration Options

```typescript
createDatadogPlugin({
  // Log errors to Datadog (default: true)
  logErrors: true,

  // Filter errors before logging
  beforeLog: (error) => boolean,

  // Add custom attributes
  globalAttributes: {
    team: 'frontend',
    feature: 'auth'
  }
});
```

## What Gets Logged

### Error Logs
- Error code and message
- Severity level (status)
- Error type
- Variables and context
- User information (if available)

### Action Logs
- Action type (REDIRECT, DISMISS, CALLBACK)
- Target URL (for REDIRECT)
- Timestamp

## Log Levels

Huh severity maps to Datadog status:
- `critical` → `error`
- `high` → `error`
- `medium` → `warn`
- `low` → `info`

## Documentation

- [Plugin Guide](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/guides/plugins.mdx)
- [Getting Started](https://github.com/sanghyuk-2i/huh#readme)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
