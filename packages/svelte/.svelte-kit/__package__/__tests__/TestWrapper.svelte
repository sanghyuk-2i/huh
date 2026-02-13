<script lang="ts">
  import type { ErrorConfig, HuhPlugin } from '@huh/core';
  import HuhProvider from '../HuhProvider.svelte';
  import type { RendererMap } from '../types';
  import TestConsumer from './TestConsumer.svelte';

  interface Props {
    source: ErrorConfig;
    renderers: RendererMap;
    onRetry?: () => void;
    onCustomAction?: (action: { type: string; target?: string }) => void;
    plugins?: HuhPlugin[];
    errorMap?: Record<string, string>;
    fallbackTrackId?: string;
  }

  let { source, renderers, onRetry, onCustomAction, plugins, errorMap, fallbackTrackId }: Props = $props();
</script>

<HuhProvider {source} {renderers} {onRetry} {onCustomAction} {plugins} {errorMap} {fallbackTrackId}>
  <TestConsumer />
</HuhProvider>
