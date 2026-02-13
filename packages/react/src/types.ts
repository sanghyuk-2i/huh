import type { ReactNode } from 'react';
import type { ResolvedError } from '@huh/core';

export interface ErrorRenderProps {
  error: ResolvedError;
  onAction: () => void;
  onDismiss: () => void;
}

export type RendererMap = Record<string, (props: ErrorRenderProps) => ReactNode>;

export interface HuhContextValue {
  huh: (code: string, variables?: Record<string, string>) => void;
  clearError: () => void;
  locale: string | undefined;
  setLocale: (locale: string) => void;
}
