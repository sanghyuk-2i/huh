# @sanghyuk-2i/huh-svelte

Svelte bindings for **Huh** - Manage error content in spreadsheets with type-safe runtime UI rendering.

## Features

- 🔥 **Svelte 5+**: Runes API with $state and $derived
- 🎨 **Custom Renderers**: Full control over error UI with snippets
- 🔄 **Auto-dismiss**: Configurable timeout
- 🌍 **i18n**: Multi-language support with locale switching
- 🧭 **Router Support**: SvelteKit custom routing integration

## Installation

```bash
npm install @sanghyuk-2i/huh-svelte @sanghyuk-2i/huh-core
```

## Basic Usage

```svelte
<script>
  import { HuhProvider } from '@sanghyuk-2i/huh-svelte';
  import errorConfig from './huh.json';

  const renderers = {
    alert: (error) => {
      // Return Svelte component or snippet
    },
    toast: (error) => {
      // Return Svelte component or snippet
    }
  };
</script>

<HuhProvider config={errorConfig} {renderers}>
  <YourApp />
</HuhProvider>
```

```svelte
<!-- In a component -->
<script>
  import { useHuh } from '@sanghyuk-2i/huh-svelte';

  const { huh } = useHuh();

  function handleError() {
    huh('AUTH_001', { username: 'john' });
  }
</script>

<button on:click={handleError}>Trigger Error</button>
```

## With SvelteKit

```svelte
<script>
  import { goto } from '$app/navigation';

  const router = {
    push: goto,
    back: () => history.back()
  };
</script>

<HuhProvider config={errorConfig} {router}>
  <YourApp />
</HuhProvider>
```

## Documentation

- [API Reference](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/api/svelte.mdx)
- [Getting Started](https://github.com/sanghyuk-2i/huh#readme)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
