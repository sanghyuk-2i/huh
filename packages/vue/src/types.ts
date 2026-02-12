import type { Component } from 'vue';
import type { ResolvedError } from '@huh/core';

export interface ErrorRenderProps {
  error: ResolvedError;
  onAction: () => void;
  onDismiss: () => void;
}

export type RendererMap = Record<string, Component<ErrorRenderProps>>;

export interface HuhContextValue {
  handleError: (trackId: string, variables?: Record<string, string>) => void;
  clearError: () => void;
}
