import type { Component } from 'svelte';
import type { ResolvedError } from '@sanghyuk-2i/huh-core';

export interface ErrorRenderProps {
  error: ResolvedError;
  onAction: () => void;
  onDismiss: () => void;
}

export type RendererMap = Record<string, Component<ErrorRenderProps>>;

export interface HuhContextValue {
  huh: (code: string, variables?: Record<string, string>) => void;
  clearError: () => void;
  locale: string | undefined;
  setLocale: (locale: string) => void;
}
