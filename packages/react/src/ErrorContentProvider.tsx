import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ErrorConfig, LocalizedErrorConfig, ResolvedError } from '@huh/core';
import { resolveError, ACTION_TYPES } from '@huh/core';
import type { RendererMap, HuhContextValue, ErrorRenderProps } from './types';

export const HuhContext = createContext<HuhContextValue | null>(null);

export interface HuhProviderProps {
  source?: ErrorConfig;
  locales?: LocalizedErrorConfig;
  defaultLocale?: string;
  locale?: string;
  renderers: RendererMap;
  children: ReactNode;
  onRetry?: () => void;
  onCustomAction?: (action: { type: string; target?: string }) => void;
}

export function HuhProvider({
  source,
  locales,
  defaultLocale,
  locale: controlledLocale,
  renderers,
  children,
  onRetry,
  onCustomAction,
}: HuhProviderProps) {
  const [activeError, setActiveError] = useState<ResolvedError | null>(null);
  const [internalLocale, setInternalLocale] = useState<string>(
    controlledLocale ?? defaultLocale ?? '',
  );

  const currentLocale = controlledLocale ?? internalLocale;

  const getActiveSource = useCallback((): ErrorConfig => {
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
  }, [source, locales, currentLocale, defaultLocale]);

  const clearError = useCallback(() => {
    setActiveError(null);
  }, []);

  const handleError = useCallback(
    (trackId: string, variables?: Record<string, string>) => {
      const activeSource = getActiveSource();
      const resolved = resolveError(activeSource, trackId, variables);
      setActiveError(resolved);
    },
    [getActiveSource],
  );

  const setLocale = useCallback((newLocale: string) => {
    setInternalLocale(newLocale);
  }, []);

  const contextValue = useMemo<HuhContextValue>(
    () => ({
      handleError,
      clearError,
      locale: locales ? currentLocale : undefined,
      setLocale,
    }),
    [handleError, clearError, currentLocale, setLocale, locales],
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
