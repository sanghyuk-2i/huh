import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sentryPlugin } from '../index';
import type { ResolvedError, ErrorAction, HuhErrorContext } from '@huh/core';

vi.mock('@sentry/browser', () => {
  const mockScope = {
    setTag: vi.fn(),
    setContext: vi.fn(),
  };
  return {
    withScope: vi.fn((cb: (scope: typeof mockScope) => void) => cb(mockScope)),
    captureMessage: vi.fn(),
    addBreadcrumb: vi.fn(),
    __mockScope: mockScope,
  };
});

import * as Sentry from '@sentry/browser';

const mockScope = (Sentry as any).__mockScope;

const mockError: ResolvedError = {
  trackId: 'ERR_001',
  type: 'TOAST',
  message: 'Something went wrong',
};

const mockContext: HuhErrorContext = {
  trackId: 'ERR_001',
  variables: { userName: 'Jane' },
  locale: 'en',
};

const mockAction: ErrorAction = {
  label: 'Retry',
  type: 'RETRY',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sentryPlugin', () => {
  it('returns a plugin with the correct name', () => {
    const plugin = sentryPlugin();
    expect(plugin.name).toBe('huh-sentry');
  });

  it('calls captureMessage on onError', () => {
    const plugin = sentryPlugin();
    plugin.onError!(mockError, mockContext);

    expect(Sentry.withScope).toHaveBeenCalled();
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'error');
  });

  it('sets tags on scope', () => {
    const plugin = sentryPlugin();
    plugin.onError!(mockError, mockContext);

    expect(mockScope.setTag).toHaveBeenCalledWith('huh.trackId', 'ERR_001');
    expect(mockScope.setTag).toHaveBeenCalledWith('huh.errorType', 'TOAST');
    expect(mockScope.setTag).toHaveBeenCalledWith('huh.locale', 'en');
  });

  it('sets context with variables', () => {
    const plugin = sentryPlugin();
    plugin.onError!(mockError, mockContext);

    expect(mockScope.setContext).toHaveBeenCalledWith('huh', {
      variables: { userName: 'Jane' },
    });
  });

  it('respects custom level option', () => {
    const plugin = sentryPlugin({ level: 'warning' });
    plugin.onError!(mockError, mockContext);

    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'warning');
  });

  it('adds custom tags', () => {
    const plugin = sentryPlugin({ tags: { env: 'production', team: 'frontend' } });
    plugin.onError!(mockError, mockContext);

    expect(mockScope.setTag).toHaveBeenCalledWith('env', 'production');
    expect(mockScope.setTag).toHaveBeenCalledWith('team', 'frontend');
  });

  it('skips error when filter returns false', () => {
    const plugin = sentryPlugin({ filter: () => false });
    plugin.onError!(mockError, mockContext);

    expect(Sentry.withScope).not.toHaveBeenCalled();
  });

  it('reports error when filter returns true', () => {
    const plugin = sentryPlugin({ filter: () => true });
    plugin.onError!(mockError, mockContext);

    expect(Sentry.captureMessage).toHaveBeenCalled();
  });

  it('does not set locale tag when locale is undefined', () => {
    const plugin = sentryPlugin();
    plugin.onError!(mockError, { trackId: 'ERR_001' });

    const localeCall = mockScope.setTag.mock.calls.find(
      (c: string[]) => c[0] === 'huh.locale',
    );
    expect(localeCall).toBeUndefined();
  });

  it('calls addBreadcrumb on onAction', () => {
    const plugin = sentryPlugin();
    plugin.onAction!(mockError, mockAction);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'huh',
      message: 'Action "RETRY" on "ERR_001"',
      level: 'info',
      data: {
        trackId: 'ERR_001',
        errorType: 'TOAST',
        actionType: 'RETRY',
      },
    });
  });

  it('includes target in breadcrumb data when present', () => {
    const plugin = sentryPlugin();
    const actionWithTarget: ErrorAction = {
      label: 'Go',
      type: 'REDIRECT',
      target: '/login',
    };
    plugin.onAction!(mockError, actionWithTarget);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ target: '/login' }),
      }),
    );
  });

  it('skips breadcrumb when breadcrumbs option is false', () => {
    const plugin = sentryPlugin({ breadcrumbs: false });
    plugin.onAction!(mockError, mockAction);

    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
  });
});
