<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { ErrorConfig, LocalizedErrorConfig, ResolvedError, HuhPlugin } from '@huh/core';
  import { resolveError, ACTION_TYPES, runPluginHook } from '@huh/core';
  import { HUH_CONTEXT_KEY } from './context';
  import type { RendererMap, HuhContextValue, ErrorRenderProps } from './types';

  interface Props {
    source?: ErrorConfig;
    locales?: LocalizedErrorConfig;
    defaultLocale?: string;
    locale?: string;
    renderers: RendererMap;
    children: Snippet;
    onRetry?: () => void;
    onCustomAction?: (action: { type: string; target?: string }) => void;
    plugins?: HuhPlugin[];
  }

  let {
    source,
    locales,
    defaultLocale,
    locale: controlledLocale,
    renderers,
    children,
    onRetry,
    onCustomAction,
    plugins = [],
  }: Props = $props();

  let activeError: ResolvedError | null = $state(null);
  let internalLocale: string = $state('');

  let currentLocale = $derived(controlledLocale ?? (internalLocale || defaultLocale) ?? '');

  function getActiveSource(): ErrorConfig {
    if (source) return source;
    if (locales && currentLocale && locales[currentLocale]) {
      return locales[currentLocale];
    }
    if (locales && defaultLocale && locales[defaultLocale]) {
      return locales[defaultLocale];
    }
    throw new Error(
      'HuhProvider requires either a "source" prop or "locales" with a valid locale.',
    );
  }

  function clearError() {
    activeError = null;
  }

  function handleError(trackId: string, variables?: Record<string, string>) {
    const activeSource = getActiveSource();
    const resolved = resolveError(activeSource, trackId, variables);
    activeError = resolved;
    runPluginHook(plugins, 'onError', resolved, {
      trackId,
      variables,
      locale: locales ? currentLocale : undefined,
    });
  }

  function setLocale(newLocale: string) {
    internalLocale = newLocale;
  }

  setContext<HuhContextValue>(HUH_CONTEXT_KEY, {
    handleError,
    clearError,
    get locale() {
      return locales ? currentLocale : undefined;
    },
    setLocale,
  });

  function createOnAction(error: ResolvedError) {
    return () => {
      const action = error.action;
      if (!action) {
        clearError();
        return;
      }

      runPluginHook(plugins, 'onAction', error, action);

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
