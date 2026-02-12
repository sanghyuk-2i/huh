import * as Sentry from '@sentry/browser';
import type { HuhPlugin, ResolvedError } from '@huh/core';

export interface SentryPluginOptions {
  level?: 'fatal' | 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  filter?: (error: ResolvedError) => boolean;
  breadcrumbs?: boolean;
}

export function sentryPlugin(options: SentryPluginOptions = {}): HuhPlugin {
  const { level = 'error', tags = {}, filter, breadcrumbs = true } = options;

  return {
    name: 'huh-sentry',
    onError(error, context) {
      if (filter && !filter(error)) return;
      Sentry.withScope((scope) => {
        scope.setTag('huh.trackId', context.trackId);
        scope.setTag('huh.errorType', error.type);
        if (context.locale) scope.setTag('huh.locale', context.locale);
        for (const [key, value] of Object.entries(tags)) {
          scope.setTag(key, value);
        }
        if (context.variables) {
          scope.setContext('huh', { variables: context.variables });
        }
        Sentry.captureMessage(`[huh] ${context.trackId}`, level);
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
