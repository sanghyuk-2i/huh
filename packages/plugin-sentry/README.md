# @sanghyuk-2i/huh-plugin-sentry

Sentry integration plugin for **Huh** - Automatic error reporting and action breadcrumbs.

## Features

- 🐛 **Auto Error Capture**: Automatically report errors to Sentry
- 📊 **Severity Mapping**: Map Huh severity to Sentry levels
- 🍞 **Breadcrumbs**: Track error actions as breadcrumbs
- 🏷️ **Tags & Context**: Rich error context and user info
- ⚙️ **Configurable**: Filter errors, customize tags

## Installation

```bash
npm install @sanghyuk-2i/huh-plugin-sentry @sanghyuk-2i/huh-core @sentry/browser
```

## Usage

```typescript
import * as Sentry from '@sentry/browser';
import { createSentryPlugin } from '@sanghyuk-2i/huh-plugin-sentry';

// Initialize Sentry
Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production'
});

// Create plugin
const sentryPlugin = createSentryPlugin({
  captureErrors: true,
  captureBreadcrumbs: true,
  beforeCapture: (error) => {
    // Filter or modify before sending
    return error.severity === 'critical';
  }
});

// Use with framework bindings
import { HuhProvider } from '@sanghyuk-2i/huh-react';

<HuhProvider config={errorConfig} plugins={[sentryPlugin]}>
  <App />
</HuhProvider>
```

## Configuration Options

```typescript
createSentryPlugin({
  // Capture errors to Sentry (default: true)
  captureErrors: true,

  // Add breadcrumbs for error actions (default: true)
  captureBreadcrumbs: true,

  // Filter errors before capture
  beforeCapture: (error) => boolean,

  // Add custom tags
  tags: { team: 'frontend', feature: 'auth' }
});
```

## What Gets Captured

### Error Events
- Error code and message
- Severity level (critical → error, high → warning, etc.)
- Variables and context
- User information (if available)

### Breadcrumbs
- Error displayed
- Action clicked (REDIRECT, DISMISS, CALLBACK)
- Navigation events

## Documentation

- [Plugin Guide](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/guides/plugins.mdx)
- [Getting Started](https://github.com/sanghyuk-2i/huh#readme)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
