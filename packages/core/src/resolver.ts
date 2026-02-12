import type { ErrorConfig, ResolvedError } from './schema';
import { renderTemplate } from './template';

/**
 * Look up an error by trackId and apply variable substitution.
 */
export function resolveError(
  config: ErrorConfig,
  trackId: string,
  variables?: Record<string, string>,
): ResolvedError {
  const entry = config[trackId];
  if (!entry) {
    throw new Error(`Unknown trackId: "${trackId}"`);
  }

  const vars = variables ?? {};

  const resolved: ResolvedError = {
    ...entry,
    trackId,
    message: renderTemplate(entry.message, vars),
  };

  if (entry.title) {
    resolved.title = renderTemplate(entry.title, vars);
  }

  if (entry.action) {
    resolved.action = {
      ...entry.action,
      label: renderTemplate(entry.action.label, vars),
      ...(entry.action.target && {
        target: renderTemplate(entry.action.target, vars),
      }),
    };
  }

  return resolved;
}
