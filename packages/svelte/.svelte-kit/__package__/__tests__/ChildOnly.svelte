<script lang="ts">
  import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
  import HuhProvider from '../HuhProvider.svelte';
  import type { RendererMap } from '../types';

  interface Props {
    source: ErrorConfig;
    renderers: RendererMap;
  }

  let { source, renderers }: Props = $props();
</script>

<HuhProvider {source} {renderers}>
  <div data-testid="child">Hello</div>
</HuhProvider>
