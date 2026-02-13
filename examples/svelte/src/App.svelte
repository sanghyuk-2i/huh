<script lang="ts">
  import { HuhProvider } from '@sanghyuk-2i/huh-svelte';
  import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
  import errorConfig from './huh.json';
  import { renderers } from './renderers';
  import Buttons from './Buttons.svelte';

  const config = errorConfig as ErrorConfig;
</script>

<HuhProvider source={config} {renderers}>
  <div id="app">
    <h1>huh — Svelte Example</h1>
    <p>버튼을 클릭하여 에러 UI를 확인하세요.</p>
    <Buttons />
  </div>
</HuhProvider>
