# @sanghyuk-2i/huh-vue

Vue bindings for **Huh** - Manage error content in spreadsheets with type-safe runtime UI rendering.

## Features

- 💚 **Vue 3+**: Composition API with provide/inject
- 🎨 **Custom Renderers**: Full control over error UI
- 🔄 **Auto-dismiss**: Configurable timeout
- 🌍 **i18n**: Multi-language support with locale switching
- 🧭 **Router Support**: Nuxt, Vue Router custom routing integration

## Installation

```bash
npm install @sanghyuk-2i/huh-vue @sanghyuk-2i/huh-core
```

## Basic Usage

```vue
<script setup>
import { HuhProvider, useHuh } from '@sanghyuk-2i/huh-vue';
import errorConfig from './huh.json';

const renderers = {
  alert: ({ error }) => h(Alert, { message: error.message }),
  toast: ({ error }) => h(Toast, { message: error.message })
};
</script>

<template>
  <HuhProvider :config="errorConfig" :renderers="renderers">
    <YourApp />
  </HuhProvider>
</template>
```

```vue
<!-- In a component -->
<script setup>
import { useHuh } from '@sanghyuk-2i/huh-vue';

const { huh } = useHuh();

const handleError = () => {
  huh('AUTH_001', { username: 'john' });
};
</script>

<template>
  <button @click="handleError">Trigger Error</button>
</template>
```

## With Nuxt Router

```vue
<script setup>
const router = useRouter();

const customRouter = {
  push: (url) => router.push(url),
  back: () => router.back()
};
</script>

<template>
  <HuhProvider :config="errorConfig" :router="customRouter">
    <YourApp />
  </HuhProvider>
</template>
```

## Documentation

- [API Reference](https://github.com/sanghyuk-2i/huh/blob/main/docs/en/api/vue.mdx)
- [Getting Started](https://github.com/sanghyuk-2i/huh#readme)

## License

MIT © [sanghyuk-2i](https://github.com/sanghyuk-2i)
