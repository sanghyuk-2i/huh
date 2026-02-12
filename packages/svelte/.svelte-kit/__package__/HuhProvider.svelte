<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { ErrorConfig, ResolvedError } from '@huh/core';
  import { resolveError, ACTION_TYPES } from '@huh/core';
  import { HUH_CONTEXT_KEY } from './context';
  import type { RendererMap, HuhContextValue, ErrorRenderProps } from './types';

  interface Props {
    source: ErrorConfig;
    renderers: RendererMap;
    children: Snippet;
    onRetry?: () => void;
    onCustomAction?: (action: { type: string; target?: string }) => void;
  }

  let { source, renderers, children, onRetry, onCustomAction }: Props = $props();

  let activeError: ResolvedError | null = $state(null);

  function clearError() {
    activeError = null;
  }

  function handleError(trackId: string, variables?: Record<string, string>) {
    const resolved = resolveError(source, trackId, variables);
    activeError = resolved;
  }

  setContext<HuhContextValue>(HUH_CONTEXT_KEY, { handleError, clearError });

  function createOnAction(error: ResolvedError) {
    return () => {
      const action = error.action;
      if (!action) {
        clearError();
        return;
      }

      switch (action.type) {
        case ACTION_TYPES.REDIRECT:
          if (action.target && typeof window !== 'undefined') {
            window.location.href = action.target;
          }
          break;
        case ACTION_TYPES.BACK:
          if (typeof window !== 'undefined') {
            window.history.back();
          }
          break;
        case ACTION_TYPES.RETRY:
          clearError();
          onRetry?.();
          break;
        case ACTION_TYPES.DISMISS:
          clearError();
          break;
        default:
          clearError();
          onCustomAction?.({ type: action.type, target: action.target });
          break;
      }
    };
  }

  let renderer = $derived(activeError ? renderers[activeError.type] : null);
  let renderProps: ErrorRenderProps | null = $derived(
    activeError
      ? {
          error: activeError,
          onAction: createOnAction(activeError),
          onDismiss: clearError,
        }
      : null,
  );
</script>

{@render children()}

{#if activeError && renderer && renderProps}
  {@const Renderer = renderer}
  <Renderer {...renderProps} />
{/if}
