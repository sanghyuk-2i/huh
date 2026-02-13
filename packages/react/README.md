# @sanghyuk-2i/huh-react

React bindings for **Huh** - Manage error content in spreadsheets with type-safe runtime UI rendering.

## Features

- ⚛️ **React 18+**: Hooks and Context API
- 🎨 **Custom Renderers**: Full control over error UI
- 🔄 **Auto-dismiss**: Configurable timeout
- 🌍 **i18n**: Multi-language support with locale switching
- 🧭 **Router Support**: Next.js, Remix custom routing integration

## Installation

```bash
npm install @sanghyuk-2i/huh-react @sanghyuk-2i/huh-core
```

## Basic Usage

```tsx
import { HuhProvider, useHuh } from '@sanghyuk-2i/huh-react';
import errorConfig from './huh.json';

function App() {
  return (
    <HuhProvider
      config={errorConfig}
      renderers={{
        alert: ({ error }) => <Alert>{error.message}</Alert>,
        toast: ({ error }) => <Toast>{error.message}</Toast>
      }}
    >
      <YourApp />
    </HuhProvider>
  );
}

function YourComponent() {
  const { huh } = useHuh();

  const handleError = () => {
    huh('AUTH_001', { username: 'john' });
  };

  return <button onClick={handleError}>Trigger Error</button>;
}
```

## With Next.js Router

```tsx
'use client';
import { useRouter } from 'next/navigation';

function App() {
  const router = useRouter();

  return (
    <HuhProvider
      config={errorConfig}
      router={{
        push: router.push,
        back: router.back
      }}
    >
      <YourApp />
    </HuhProvider>
  );
}
```

## Documentation

- [API Reference](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/api/react.mdx)
- [Getting Started](https://github.com/sanghyuk-2i/huh#readme)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
