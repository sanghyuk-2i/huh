import type { ErrorConfig, ValidationError } from '@huh/core';
import { validateConfig } from '@huh/core';
import type { ScreenshotResult, ExtendedValidationIssue } from './types';

export interface ExtendedValidationResult {
  coreErrors: ValidationError[];
  coreWarnings: ValidationError[];
  extendedIssues: ExtendedValidationIssue[];
}

const MAX_TOAST_MESSAGE_LENGTH = 120;
const MAX_MODAL_MESSAGE_LENGTH = 500;
const MAX_PAGE_MESSAGE_LENGTH = 300;
const SLOW_RENDER_THRESHOLD_MS = 3000;

export function runExtendedValidation(
  config: ErrorConfig,
  screenshots: ScreenshotResult[],
): ExtendedValidationResult {
  // Run core validation
  const coreResult = validateConfig(config);
  const extendedIssues: ExtendedValidationIssue[] = [];

  const screenshotMap = new Map<string, ScreenshotResult>();
  for (const ss of screenshots) {
    screenshotMap.set(ss.trackId, ss);
  }

  for (const [trackId, entry] of Object.entries(config)) {
    const ss = screenshotMap.get(trackId);

    // Render failure detection
    if (ss && !ss.success) {
      extendedIssues.push({
        trackId,
        kind: 'render-failure',
        severity: 'error',
        message: `Render failed: ${ss.error ?? 'unknown error'}`,
      });
    }

    // Image URL validation (basic check)
    if (entry.image) {
      try {
        new URL(entry.image);
      } catch {
        extendedIssues.push({
          trackId,
          kind: 'image-url-broken',
          severity: 'warning',
          message: `Invalid image URL: ${entry.image}`,
        });
      }
    }

    // Message length validation (type-specific)
    const maxLen = getMaxMessageLength(entry.type);
    if (maxLen && entry.message.length > maxLen) {
      extendedIssues.push({
        trackId,
        kind: 'message-too-long',
        severity: 'warning',
        message: `Message length (${entry.message.length}) exceeds recommended max (${maxLen}) for ${entry.type}`,
      });
    }

    // Slow render detection
    if (ss && ss.success && ss.renderTimeMs > SLOW_RENDER_THRESHOLD_MS) {
      extendedIssues.push({
        trackId,
        kind: 'slow-render',
        severity: 'warning',
        message: `Render took ${ss.renderTimeMs}ms (threshold: ${SLOW_RENDER_THRESHOLD_MS}ms)`,
      });
    }

    // Template variable detection (unresolved placeholders)
    const unresolvedVars = findUnresolvedVariables(entry.message);
    if (entry.title) {
      unresolvedVars.push(...findUnresolvedVariables(entry.title));
    }
    if (entry.action?.label) {
      unresolvedVars.push(...findUnresolvedVariables(entry.action.label));
    }
    if (unresolvedVars.length > 0) {
      extendedIssues.push({
        trackId,
        kind: 'missing-template-variable',
        severity: 'warning',
        message: `Template variables found: ${[...new Set(unresolvedVars)].join(', ')}. Provide values in simulate.variables or simulate.defaultVariables.`,
      });
    }
  }

  return {
    coreErrors: coreResult.errors,
    coreWarnings: coreResult.warnings,
    extendedIssues,
  };
}

function getMaxMessageLength(type: string): number | null {
  switch (type.toUpperCase()) {
    case 'TOAST':
      return MAX_TOAST_MESSAGE_LENGTH;
    case 'MODAL':
      return MAX_MODAL_MESSAGE_LENGTH;
    case 'PAGE':
      return MAX_PAGE_MESSAGE_LENGTH;
    default:
      return null;
  }
}

function findUnresolvedVariables(template: string): string[] {
  const matches: string[] = [];
  const regex = /\{\{(\w+)\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    matches.push(`{{${match[1]}}}`);
  }
  return matches;
}
