import type { ErrorConfig, ValidationError } from '@huh/core';

// ── CLI Options ──

export interface TestCommandOptions {
  mode: 'standalone' | 'app';
  url?: string;
  config: string;
  output: string;
  filter?: string;
  type?: string;
  device: DevicePreset;
  open: boolean;
  ci: boolean;
  diff: boolean;
}

export type DevicePreset = 'desktop' | 'mobile' | 'tablet';

export interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}

export const DEVICE_CONFIGS: Record<DevicePreset, DeviceConfig> = {
  desktop: { name: 'Desktop', width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false },
  mobile: { name: 'Mobile', width: 375, height: 812, deviceScaleFactor: 2, isMobile: true },
  tablet: { name: 'Tablet', width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true },
};

// ── Screenshot ──

export interface ScreenshotResult {
  trackId: string;
  type: string;
  buffer: Buffer;
  width: number;
  height: number;
  renderTimeMs: number;
  success: boolean;
  error?: string;
}

// ── Extended Validation ──

export type ExtendedIssueKind =
  | 'render-failure'
  | 'image-url-broken'
  | 'message-too-long'
  | 'slow-render'
  | 'missing-template-variable';

export interface ExtendedValidationIssue {
  trackId: string;
  kind: ExtendedIssueKind;
  severity: 'error' | 'warning';
  message: string;
}

// ── Test Entry (per trackId result) ──

export interface TestEntryResult {
  trackId: string;
  type: string;
  screenshotBase64: string;
  renderTimeMs: number;
  success: boolean;
  error?: string;
  validationIssues: ExtendedValidationIssue[];
  coreValidationErrors: ValidationError[];
  coreValidationWarnings: ValidationError[];
}

// ── Report Data ──

export interface ReportData {
  generatedAt: string;
  device: DeviceConfig;
  mode: 'standalone' | 'app';
  totalEntries: number;
  passCount: number;
  failCount: number;
  warningCount: number;
  entries: TestEntryResult[];
}

// ── Diff ──

export interface DiffEntry {
  trackId: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  details?: string;
}

export interface DiffResult {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffEntry[];
  unchanged: DiffEntry[];
  summary: string;
}

// ── Simulate Config (extends HuhCliConfig) ──

export interface SimulateConfig {
  variables?: Record<string, Record<string, string>>;
  defaultVariables?: Record<string, string>;
  waitTimeout?: number;
  screenshotDelay?: number;
}
