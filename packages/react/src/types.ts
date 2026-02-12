import type { ReactNode } from 'react';
import type { ResolvedError, ErrorAction } from '@huh/core';

export interface ErrorRenderProps {
  error: ResolvedError;
  onAction: () => void;
  onDismiss: () => void;
}

export type RendererMap = Record<string, (props: ErrorRenderProps) => ReactNode>;

export interface HuhContextValue {
  handleError: (trackId: string, variables?: Record<string, string>) => void;
  clearError: () => void;
}
