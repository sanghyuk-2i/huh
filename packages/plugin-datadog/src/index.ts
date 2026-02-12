import { datadogLogs } from '@datadog/browser-logs';
import type { HuhPlugin, ResolvedError } from '@huh/core';

export interface DatadogPluginOptions {
  level?: 'error' | 'warn' | 'info' | 'debug';
  service?: string;
  filter?: (error: ResolvedError) => boolean;
  actionTracking?: boolean;
}

export function datadogPlugin(options: DatadogPluginOptions = {}): HuhPlugin {
  const { level = 'error', service, filter, actionTracking = true } = options;

  return {
    name: 'huh-datadog',
    onError(error, context) {
      if (filter && !filter(error)) return;

      const logContext: Record<string, unknown> = {
        huh: {
          trackId: context.trackId,
          errorType: error.type,
          ...(context.locale && { locale: context.locale }),
          ...(context.variables && { variables: context.variables }),
        },
        ...(service && { service }),
      };

      datadogLogs.logger[level](
        `[huh] ${context.trackId}`,
        logContext,
      );
    },
    onAction(error, action) {
      if (!actionTracking) return;

      datadogLogs.logger.info(
        `[huh] Action "${action.type}" on "${error.trackId}"`,
        {
          huh: {
            trackId: error.trackId,
            errorType: error.type,
            actionType: action.type,
            ...(action.target && { target: action.target }),
          },
          ...(service && { service }),
        },
      );
    },
  };
}
