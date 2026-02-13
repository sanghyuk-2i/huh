// Built-in error types (uppercase constants)
export const ERROR_TYPES = {
  TOAST: 'TOAST',
  MODAL: 'MODAL',
  PAGE: 'PAGE',
} as const;

// Built-in action types (uppercase constants)
export const ACTION_TYPES = {
  REDIRECT: 'REDIRECT',
  RETRY: 'RETRY',
  BACK: 'BACK',
  DISMISS: 'DISMISS',
} as const;

// Built-in severity levels (uppercase constants)
export const SEVERITY_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const;

export type BuiltInErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];
export type BuiltInActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];
export type BuiltInSeverity = (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];

// Open-ended string types — built-in values + any user-defined custom type
export type ErrorType = BuiltInErrorType | (string & {});
export type ActionType = BuiltInActionType | (string & {});
export type Severity = BuiltInSeverity | (string & {});

export interface ErrorAction {
  label: string;
  type: ActionType;
  target?: string;
}

export interface ErrorEntry {
  type: ErrorType;
  message: string;
  title?: string;
  image?: string;
  severity?: Severity;
  action?: ErrorAction;
}

export type ErrorConfig = Record<string, ErrorEntry>;

export type LocalizedErrorConfig = Record<string, ErrorConfig>;

export interface ResolvedError extends ErrorEntry {
  trackId: string;
}

export interface ValidationError {
  trackId?: string;
  field?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface CrossLocaleValidationError {
  trackId: string;
  field?: string;
  locales: string[];
  message: string;
}

export interface CrossLocaleValidationResult {
  valid: boolean;
  errors: CrossLocaleValidationError[];
  warnings: CrossLocaleValidationError[];
}

export interface HuhErrorContext {
  trackId: string;
  variables?: Record<string, string>;
  locale?: string;
  severity?: Severity;
}

export interface HuhRouter {
  push: (url: string) => void;
  back: () => void;
}

export interface HuhPlugin {
  name: string;
  onError?: (error: ResolvedError, context: HuhErrorContext) => void;
  onAction?: (error: ResolvedError, action: ErrorAction) => void;
}
