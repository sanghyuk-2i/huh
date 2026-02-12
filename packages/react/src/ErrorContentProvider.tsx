import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ErrorConfig, ResolvedError } from '@huh/core';
import { resolveError, ACTION_TYPES } from '@huh/core';
import type { RendererMap, HuhContextValue, ErrorRenderProps } from './types';

export const HuhContext = createContext<HuhContextValue | null>(null);

export interface HuhProviderProps {
  source: ErrorConfig;
  renderers: RendererMap;
  children: ReactNode;
  onRetry?: () => void;
  onCustomAction?: (action: { type: string; target?: string }) => void;
}

export function HuhProvider({
  source,
  renderers,
  children,
  onRetry,
  onCustomAction,
}: HuhProviderProps) {
  const [activeError, setActiveError] = useState<ResolvedError | null>(null);

  const clearError = useCallback(() => {
    setActiveError(null);
  }, []);

  const handleError = useCallback(
    (trackId: string, variables?: Record<string, string>) => {
      const resolved = resolveError(source, trackId, variables);
      setActiveError(resolved);
    },
    [source],
  );

  const contextValue = useMemo<HuhContextValue>(
    () => ({ handleError, clearError }),
    [handleError, clearError],
  );

  const createOnAction = useCallback(
    (error: ResolvedError) => {
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
            // Custom action type — delegate to user callback, then clear
            clearError();
            onCustomAction?.({ type: action.type, target: action.target });
            break;
        }
      };
    },
    [clearError, onRetry, onCustomAction],
  );

  const renderError = () => {
    if (!activeError) return null;

    const renderer = renderers[activeError.type];
    if (!renderer) {
      throw new Error(
        `Missing renderer for error type "${activeError.type}". ` +
          `Registered renderers: ${Object.keys(renderers).join(', ')}`,
      );
    }

    const props: ErrorRenderProps = {
      error: activeError,
      onAction: createOnAction(activeError),
      onDismiss: clearError,
    };

    return renderer(props);
  };

  return (
    <HuhContext.Provider value={contextValue}>
      {children}
      {renderError()}
    </HuhContext.Provider>
  );
}
