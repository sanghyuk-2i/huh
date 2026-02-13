import * as Sentry from '@sentry/browser';
import type { HuhPlugin, ResolvedError, HuhErrorContext } from '@huh/core';

declare const window: { location: { pathname: string } } | undefined;

type SentryLevel = 'fatal' | 'error' | 'warning' | 'info';

export interface SentryPluginOptions {
  level?: SentryLevel;
  tags?: Record<string, string>;
  filter?: (error: ResolvedError) => boolean;
  breadcrumbs?: boolean;
  ignoreTypes?: string[];
  ignoreTrackIds?: string[];
  urlPatterns?: Array<[RegExp, string]>;
  enrichContext?: (error: ResolvedError, context: HuhErrorContext) => Record<string, unknown>;
  sensitiveKeys?: Array<string | RegExp>;
}

const SEVERITY_TO_SENTRY: Record<string, SentryLevel> = {
  CRITICAL: 'fatal',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export function resolveSentryLevel(
  error: ResolvedError,
  context: HuhErrorContext,
  fallbackLevel: SentryLevel,
): SentryLevel {
  const severity = context.severity ?? error.severity;
  if (severity && severity in SEVERITY_TO_SENTRY) {
    return SEVERITY_TO_SENTRY[severity];
  }
  return fallbackLevel;
}

export function maskSensitiveData(
  variables: Record<string, string>,
  sensitiveKeys: Array<string | RegExp>,
): Record<string, string> {
  const masked = { ...variables };
  for (const key of Object.keys(masked)) {
    for (const pattern of sensitiveKeys) {
      const matches = typeof pattern === 'string' ? key === pattern : pattern.test(key);
      if (matches) {
        masked[key] = '[REDACTED]';
        break;
      }
    }
  }
  return masked;
}

export function normalizeUrl(url: string, urlPatterns: Array<[RegExp, string]>): string {
  for (const [pattern, replacement] of urlPatterns) {
    if (pattern.test(url)) {
      return url.replace(pattern, replacement);
    }
  }
  return url;
}

export function sentryPlugin(options: SentryPluginOptions = {}): HuhPlugin {
  const {
    level = 'error',
    tags = {},
    filter,
    breadcrumbs = true,
    ignoreTypes = [],
    ignoreTrackIds = [],
    urlPatterns = [],
    enrichContext,
    sensitiveKeys = [],
  } = options;

  return {
    name: 'huh-sentry',
    onError(error, context) {
      // Existing filter
      if (filter && !filter(error)) return;

      // ignoreTypes / ignoreTrackIds filtering
      if (ignoreTypes.includes(error.type)) return;
      if (ignoreTrackIds.includes(context.trackId)) return;

      // Resolve Sentry level from severity
      const sentryLevel = resolveSentryLevel(error, context, level);

      Sentry.withScope((scope) => {
        scope.setTag('huh.trackId', context.trackId);
        scope.setTag('huh.errorType', error.type);
        if (context.locale) scope.setTag('huh.locale', context.locale);
        if (context.severity) scope.setTag('huh.severity', context.severity);
        for (const [key, value] of Object.entries(tags)) {
          scope.setTag(key, value);
        }

        // Mask sensitive data in variables
        const vars = context.variables
          ? sensitiveKeys.length > 0
            ? maskSensitiveData(context.variables, sensitiveKeys)
            : context.variables
          : undefined;

        if (vars) {
          scope.setContext('huh', { variables: vars });
        }

        // URL pattern fingerprinting
        if (urlPatterns.length > 0 && typeof window !== 'undefined') {
          const normalizedUrl = normalizeUrl(window.location.pathname, urlPatterns);
          scope.setFingerprint(['{{ default }}', normalizedUrl]);
        }

        // Enrich context
        if (enrichContext) {
          const extra = enrichContext(error, context);
          scope.setContext('huh.enriched', extra);
        }

        Sentry.captureMessage(`[huh] ${context.trackId}`, sentryLevel);
      });
    },
    onAction(error, action) {
      if (!breadcrumbs) return;
      Sentry.addBreadcrumb({
        category: 'huh',
        message: `Action "${action.type}" on "${error.trackId}"`,
        level: 'info',
        data: {
          trackId: error.trackId,
          errorType: error.type,
          actionType: action.type,
          ...(action.target && { target: action.target }),
        },
      });
    },
  };
}
