import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ErrorConfig, LocalizedErrorConfig, ResolvedError, HuhPlugin } from '@huh/core';
import { resolveError, ACTION_TYPES, runPluginHook } from '@huh/core';
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
  plugins?: HuhPlugin[];
  errorMap?: Record<string, string>;
  fallbackTrackId?: string;
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
  plugins = [],
  errorMap,
  fallbackTrackId,
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
      runPluginHook(plugins, 'onError', resolved, {
        trackId,
        variables,
        locale: locales ? currentLocale : undefined,
        severity: resolved.severity,
      });
    },
    [getActiveSource, plugins, locales, currentLocale],
  );

  const handleErrorByCode = useCallback(
    (code: string, variables?: Record<string, string>) => {
      // 1. Check errorMap
      if (errorMap && code in errorMap) {
        handleError(errorMap[code], variables);
        return;
      }
      // 2. Check if code is a direct trackId
      const activeSource = getActiveSource();
      if (code in activeSource) {
        handleError(code, variables);
        return;
      }
      // 3. Use fallbackTrackId
      if (fallbackTrackId) {
        handleError(fallbackTrackId, variables);
        return;
      }
      throw new Error(
        `No mapping found for error code "${code}". Provide an errorMap, a matching trackId, or a fallbackTrackId.`,
      );
    },
    [handleError, errorMap, fallbackTrackId, getActiveSource],
  );

  const setLocale = useCallback((newLocale: string) => {
    setInternalLocale(newLocale);
  }, []);

  const contextValue = useMemo<HuhContextValue>(
    () => ({
      handleError,
      handleErrorByCode,
      clearError,
      locale: locales ? currentLocale : undefined,
      setLocale,
    }),
    [handleError, handleErrorByCode, clearError, currentLocale, setLocale, locales],
  );

  const createOnAction = useCallback(
    (error: ResolvedError) => {
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
            // Custom action type — delegate to user callback, then clear
            clearError();
            onCustomAction?.({ type: action.type, target: action.target });
            break;
        }
      };
    },
    [clearError, onRetry, onCustomAction, plugins],
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
