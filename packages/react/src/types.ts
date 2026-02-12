import type { ReactNode } from 'react';
import type { ResolvedError, ErrorConfig, LocalizedErrorConfig } from '@huh/core';

export interface ErrorRenderProps {
  error: ResolvedError;
  onAction: () => void;
  onDismiss: () => void;
}

export type RendererMap = Record<string, (props: ErrorRenderProps) => ReactNode>;

export interface HuhContextValue {
  handleError: (trackId: string, variables?: Record<string, string>) => void;
  clearError: () => void;
  locale: string | undefined;
  setLocale: (locale: string) => void;
}
