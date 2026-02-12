import { defineComponent, ref, provide, h, toRaw } from 'vue';
import type { PropType, InjectionKey } from 'vue';
import type { ErrorConfig, ResolvedError } from '@huh/core';
import { resolveError, ACTION_TYPES } from '@huh/core';
import type { RendererMap, HuhContextValue, ErrorRenderProps } from './types';

export const HuhInjectionKey: InjectionKey<HuhContextValue> = Symbol('HuhContext');

export const HuhProvider = defineComponent({
  name: 'HuhProvider',
  props: {
    source: {
      type: Object as PropType<ErrorConfig>,
      required: true,
    },
    renderers: {
      type: Object as PropType<RendererMap>,
      required: true,
    },
    onRetry: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
    onCustomAction: {
      type: Function as PropType<(action: { type: string; target?: string }) => void>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const activeError = ref<ResolvedError | null>(null);

    const clearError = () => {
      activeError.value = null;
    };

    const handleError = (trackId: string, variables?: Record<string, string>) => {
      const resolved = resolveError(props.source, trackId, variables);
      activeError.value = resolved;
    };

    provide(HuhInjectionKey, { handleError, clearError });

    const createOnAction = (error: ResolvedError) => {
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
            props.onRetry?.();
            break;
          case ACTION_TYPES.DISMISS:
            clearError();
            break;
          default:
            clearError();
            props.onCustomAction?.({ type: action.type, target: action.target });
            break;
        }
      };
    };

    return () => {
      const children = slots.default?.();
      const error = activeError.value;

      if (!error) {
        return children;
      }

      const renderer = toRaw(props.renderers[error.type]);
      if (!renderer) {
        throw new Error(
          `Missing renderer for error type "${error.type}". ` +
            `Registered renderers: ${Object.keys(props.renderers).join(', ')}`,
        );
      }

      const renderProps: ErrorRenderProps = {
        error,
        onAction: createOnAction(error),
        onDismiss: clearError,
      };

      return [children, h(renderer, renderProps)];
    };
  },
});
