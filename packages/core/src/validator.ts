import type { ErrorConfig, ValidationResult, ValidationError } from './schema';
import { ERROR_TYPES, ACTION_TYPES, SEVERITY_LEVELS } from './schema';

const BUILT_IN_ERROR_TYPES = Object.values(ERROR_TYPES) as string[];
const BUILT_IN_ACTION_TYPES = Object.values(ACTION_TYPES) as string[];
const BUILT_IN_SEVERITY_LEVELS = Object.values(SEVERITY_LEVELS) as string[];

export function validateConfig(config: ErrorConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const trackIds = Object.keys(config);

  if (trackIds.length === 0) {
    warnings.push({ message: 'Config is empty — no error entries found' });
  }

  for (const trackId of trackIds) {
    const entry = config[trackId];

    // Required fields
    if (!entry.type) {
      errors.push({ trackId, field: 'type', message: 'Missing required field: type' });
    }

    if (!entry.message) {
      errors.push({ trackId, field: 'message', message: 'Missing required field: message' });
    }

    // Action validation
    if (entry.action) {
      if (!entry.action.label) {
        errors.push({
          trackId,
          field: 'action.label',
          message: 'Action is missing required field: label',
        });
      }
      if (!entry.action.type) {
        errors.push({
          trackId,
          field: 'action.type',
          message: 'Action is missing required field: type',
        });
      }

      // REDIRECT requires target (built-in rule)
      if (entry.action.type === ACTION_TYPES.REDIRECT && !entry.action.target) {
        errors.push({
          trackId,
          field: 'action.target',
          message: 'Action type "REDIRECT" requires a target URL',
        });
      }
    }

    // Built-in type-specific warnings
    if (entry.type === ERROR_TYPES.TOAST && entry.title) {
      warnings.push({
        trackId,
        field: 'title',
        message: 'TOAST errors typically do not display a title',
      });
    }

    if (entry.type === ERROR_TYPES.TOAST && entry.image) {
      warnings.push({
        trackId,
        field: 'image',
        message: 'TOAST errors typically do not display an image',
      });
    }

    if (entry.type === ERROR_TYPES.PAGE && !entry.action) {
      warnings.push({
        trackId,
        field: 'action',
        message: 'PAGE errors should provide an action for user navigation',
      });
    }

    // Severity warning for unrecognized values
    if (entry.severity && !BUILT_IN_SEVERITY_LEVELS.includes(entry.severity)) {
      warnings.push({
        trackId,
        field: 'severity',
        message: `Unrecognized severity "${entry.severity}". Built-in levels: ${BUILT_IN_SEVERITY_LEVELS.join(', ')}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
