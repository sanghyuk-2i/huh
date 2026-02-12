<script lang="ts">
  import type { ErrorConfig } from '@huh/core';
  import HuhProvider from '../HuhProvider.svelte';
  import type { RendererMap } from '../types';
  import TestConsumer from './TestConsumer.svelte';

  interface Props {
    source: ErrorConfig;
    renderers: RendererMap;
    onRetry?: () => void;
    onCustomAction?: (action: { type: string; target?: string }) => void;
  }

  let { source, renderers, onRetry, onCustomAction }: Props = $props();
</script>

<HuhProvider {source} {renderers} {onRetry} {onCustomAction}>
  <TestConsumer />
</HuhProvider>
