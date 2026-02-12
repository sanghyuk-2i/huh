# Getting Started

Huh works in 3 steps:

1. **Data source** — Write error messages (non-developers)
   - Supports Google Sheets, Airtable, Notion, CSV, XLSX
2. **CLI** — Convert data to a JSON file (build time)
3. **React Provider** — Render error UI by Track ID (runtime)

## Installation

```bash
# For React projects
pnpm add @huh/core @huh/react
pnpm add -D @huh/cli

# For Node.js with core only
pnpm add @huh/core
```

### CDN Usage (no bundler)

`@huh/core` is a zero-dependency pure JS library, so you can use it directly via a `<script>` tag:

```html
<!-- unpkg -->
<script src="https://unpkg.com/@huh/core"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@huh/core"></script>
```

After loading, all APIs are available via the `window.HuhCore` global variable:

```html
<script src="https://unpkg.com/@huh/core"></script>
<script>
  var config = { /* ErrorConfig JSON */ };
  var resolved = HuhCore.resolveError(config, 'ERR_AUTH', { userName: 'Jane' });
  console.log(resolved.message);
</script>
```

## Step 1: Prepare a Data Source

Create your data using the following column structure. (Same for Google Sheets, Airtable, Notion, CSV, and XLSX)

| trackId | type | message | title | image | actionLabel | actionType | actionTarget |
|---------|------|---------|-------|-------|-------------|------------|--------------|
| ERR_LOGIN_FAILED | TOAST | Login failed | | | | | |
| ERR_SESSION_EXPIRED | MODAL | {{userName}}'s session has expired | Session Expired | | Login Again | REDIRECT | /login |
| ERR_NOT_FOUND | PAGE | The page you requested could not be found | 404 | /images/404.png | Go Home | REDIRECT | / |

> `type` and `actionType` are managed in uppercase. Even if you enter lowercase, the CLI will automatically convert them to uppercase.
> In addition to the built-in types (`TOAST`, `MODAL`, `PAGE`), you can freely add custom types such as `BANNER`, `SNACKBAR`, etc.

Setup guides for each data source:
- [Google Sheet Setup Guide](./google-sheet-guide.en.md)
- [Airtable Integration Guide](./airtable-guide.en.md)
- [Notion Integration Guide](./notion-guide.en.md)
- [CSV File Guide](./csv-guide.en.md)
- [XLSX File Guide](./xlsx-guide.en.md)

## Step 2: Generate JSON with the CLI

```bash
# Create a config file in your project
npx huh init

# Configure your data source in .huh.config.ts (or .json), then run
npx huh pull

# Validate the generated JSON
npx huh validate
```

Running the `pull` command generates the `src/huh.json` file:

```json
{
  "ERR_LOGIN_FAILED": {
    "type": "TOAST",
    "message": "Login failed"
  },
  "ERR_SESSION_EXPIRED": {
    "type": "MODAL",
    "message": "{{userName}}'s session has expired",
    "title": "Session Expired",
    "action": {
      "label": "Login Again",
      "type": "REDIRECT",
      "target": "/login"
    }
  }
}
```

## Step 3: Use in Your React App

### Provider Setup

```tsx
import React from 'react';
import errorContent from './huh.json';
import { HuhProvider } from '@huh/react';
import type { RendererMap } from '@huh/react';

// Provide renderers for each error type you use (uppercase keys)
// Custom types also work automatically when you add a renderer
const renderers: RendererMap = {
  TOAST: ({ error, onDismiss }) => (
    <div className="toast">
      <p>{error.message}</p>
      <button onClick={onDismiss}>Close</button>
    </div>
  ),
  MODAL: ({ error, onAction, onDismiss }) => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{error.title}</h2>
        <p>{error.message}</p>
        {error.action && (
          <button onClick={onAction}>{error.action.label}</button>
        )}
        <button onClick={onDismiss}>Close</button>
      </div>
    </div>
  ),
  PAGE: ({ error, onAction }) => (
    <div className="error-page">
      {error.image && <img src={error.image} alt="" />}
      <h1>{error.title}</h1>
      <p>{error.message}</p>
      {error.action && (
        <button onClick={onAction}>{error.action.label}</button>
      )}
    </div>
  ),
};

function App() {
  return (
    <HuhProvider source={errorContent} renderers={renderers}>
      <YourApp />
    </HuhProvider>
  );
}
```

### Triggering Errors

```tsx
import { useHuh } from '@huh/react';

function LoginForm() {
  const { handleError } = useHuh();

  const onSubmit = async (formData: FormData) => {
    try {
      await login(formData);
    } catch (error) {
      // Trigger error UI by trackId
      handleError('ERR_LOGIN_FAILED');
    }
  };

  return <form onSubmit={onSubmit}>{/* ... */}</form>;
}
```

### Variable Substitution

You can use template variables in the format `{{variableName}}` in your messages:

```tsx
// Sheet: "{{userName}}'s session has expired"
handleError('ERR_SESSION_EXPIRED', { userName: 'Jane' });
// Result: "Jane's session has expired"
```

## Next Steps

- [@huh/core API Reference](./api-core.en.md) - Types, parsing, validation details
- [@huh/react Guide](./api-react.en.md) - Provider, hooks, renderer details
- [@huh/cli Guide](./api-cli.en.md) - CLI command details
- [CSV File Guide](./csv-guide.en.md) - Local CSV file integration
- [XLSX File Guide](./xlsx-guide.en.md) - Local XLSX file integration
