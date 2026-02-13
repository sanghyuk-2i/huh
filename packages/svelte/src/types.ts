import type { Component } from 'svelte';
import type { ResolvedError } from '@huh/core';

export interface ErrorRenderProps {
  error: ResolvedError;
  onAction: () => void;
  onDismiss: () => void;
}

export type RendererMap = Record<string, Component<ErrorRenderProps>>;

export interface HuhContextValue {
  handleError: (trackId: string, variables?: Record<string, string>) => void;
  handleErrorByCode: (code: string, variables?: Record<string, string>) => void;
  clearError: () => void;
  locale: string | undefined;
  setLocale: (locale: string) => void;
}
