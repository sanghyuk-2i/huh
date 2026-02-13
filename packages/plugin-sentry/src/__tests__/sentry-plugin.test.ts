import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sentryPlugin, resolveSentryLevel, maskSensitiveData, normalizeUrl } from '../index';
import type { ResolvedError, ErrorAction, HuhErrorContext } from '@sanghyuk-2i/huh-core';

vi.mock('@sentry/browser', () => {
  const mockScope = {
    setTag: vi.fn(),
    setContext: vi.fn(),
    setFingerprint: vi.fn(),
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

    const localeCall = mockScope.setTag.mock.calls.find((c: string[]) => c[0] === 'huh.locale');
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

describe('severity → Sentry level mapping', () => {
  it('maps CRITICAL severity to fatal', () => {
    const plugin = sentryPlugin();
    plugin.onError!(
      { ...mockError, severity: 'CRITICAL' },
      { ...mockContext, severity: 'CRITICAL' },
    );
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'fatal');
  });

  it('maps ERROR severity to error', () => {
    const plugin = sentryPlugin();
    plugin.onError!({ ...mockError, severity: 'ERROR' }, { ...mockContext, severity: 'ERROR' });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'error');
  });

  it('maps WARNING severity to warning', () => {
    const plugin = sentryPlugin();
    plugin.onError!({ ...mockError, severity: 'WARNING' }, { ...mockContext, severity: 'WARNING' });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'warning');
  });

  it('maps INFO severity to info', () => {
    const plugin = sentryPlugin();
    plugin.onError!({ ...mockError, severity: 'INFO' }, { ...mockContext, severity: 'INFO' });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'info');
  });

  it('falls back to level option when severity is unrecognized', () => {
    const plugin = sentryPlugin({ level: 'warning' });
    plugin.onError!({ ...mockError, severity: 'CUSTOM' }, { ...mockContext, severity: 'CUSTOM' });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'warning');
  });

  it('falls back to level option when severity is absent', () => {
    const plugin = sentryPlugin({ level: 'info' });
    plugin.onError!(mockError, mockContext);
    expect(Sentry.captureMessage).toHaveBeenCalledWith('[huh] ERR_001', 'info');
  });

  it('sets huh.severity tag when severity is present', () => {
    const plugin = sentryPlugin();
    plugin.onError!(
      { ...mockError, severity: 'CRITICAL' },
      { ...mockContext, severity: 'CRITICAL' },
    );
    expect(mockScope.setTag).toHaveBeenCalledWith('huh.severity', 'CRITICAL');
  });
});

describe('ignoreTypes / ignoreTrackIds', () => {
  it('skips error when type is in ignoreTypes', () => {
    const plugin = sentryPlugin({ ignoreTypes: ['TOAST'] });
    plugin.onError!(mockError, mockContext);
    expect(Sentry.withScope).not.toHaveBeenCalled();
  });

  it('reports error when type is not in ignoreTypes', () => {
    const plugin = sentryPlugin({ ignoreTypes: ['MODAL'] });
    plugin.onError!(mockError, mockContext);
    expect(Sentry.captureMessage).toHaveBeenCalled();
  });

  it('skips error when trackId is in ignoreTrackIds', () => {
    const plugin = sentryPlugin({ ignoreTrackIds: ['ERR_001'] });
    plugin.onError!(mockError, mockContext);
    expect(Sentry.withScope).not.toHaveBeenCalled();
  });

  it('reports error when trackId is not in ignoreTrackIds', () => {
    const plugin = sentryPlugin({ ignoreTrackIds: ['ERR_999'] });
    plugin.onError!(mockError, mockContext);
    expect(Sentry.captureMessage).toHaveBeenCalled();
  });
});

describe('sensitiveKeys masking', () => {
  it('masks variables matching string keys', () => {
    const plugin = sentryPlugin({ sensitiveKeys: ['userName'] });
    plugin.onError!(mockError, mockContext);
    expect(mockScope.setContext).toHaveBeenCalledWith('huh', {
      variables: { userName: '[REDACTED]' },
    });
  });

  it('masks variables matching RegExp keys', () => {
    const plugin = sentryPlugin({ sensitiveKeys: [/^user/] });
    plugin.onError!(mockError, {
      ...mockContext,
      variables: { userName: 'Jane', userId: '123', email: 'j@x.com' },
    });
    expect(mockScope.setContext).toHaveBeenCalledWith('huh', {
      variables: { userName: '[REDACTED]', userId: '[REDACTED]', email: 'j@x.com' },
    });
  });

  it('does not mask when no sensitiveKeys match', () => {
    const plugin = sentryPlugin({ sensitiveKeys: ['password'] });
    plugin.onError!(mockError, mockContext);
    expect(mockScope.setContext).toHaveBeenCalledWith('huh', {
      variables: { userName: 'Jane' },
    });
  });
});

describe('urlPatterns fingerprint', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    (globalThis as any).window = {
      location: { pathname: '/users/123/orders/456' },
    };
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = originalWindow;
    }
  });

  it('sets fingerprint with normalized URL', () => {
    const plugin = sentryPlugin({
      urlPatterns: [[/\/users\/\d+/, '/users/:id']],
    });
    plugin.onError!(mockError, mockContext);
    expect(mockScope.setFingerprint).toHaveBeenCalledWith([
      '{{ default }}',
      '/users/:id/orders/456',
    ]);
  });

  it('does not set fingerprint when no urlPatterns', () => {
    const plugin = sentryPlugin();
    plugin.onError!(mockError, mockContext);
    expect(mockScope.setFingerprint).not.toHaveBeenCalled();
  });
});

describe('enrichContext', () => {
  it('calls enrichContext and sets extra context', () => {
    const enrichContext = vi.fn().mockReturnValue({ requestId: 'abc-123' });
    const plugin = sentryPlugin({ enrichContext });
    plugin.onError!(mockError, mockContext);

    expect(enrichContext).toHaveBeenCalledWith(mockError, mockContext);
    expect(mockScope.setContext).toHaveBeenCalledWith('huh.enriched', {
      requestId: 'abc-123',
    });
  });
});

describe('resolveSentryLevel', () => {
  it('returns mapped level for known severity', () => {
    expect(resolveSentryLevel(mockError, { ...mockContext, severity: 'CRITICAL' }, 'error')).toBe(
      'fatal',
    );
  });

  it('returns fallback for unknown severity', () => {
    expect(resolveSentryLevel(mockError, { ...mockContext, severity: 'CUSTOM' }, 'warning')).toBe(
      'warning',
    );
  });

  it('returns fallback when no severity', () => {
    expect(resolveSentryLevel(mockError, mockContext, 'info')).toBe('info');
  });
});

describe('maskSensitiveData', () => {
  it('masks matching string keys', () => {
    const result = maskSensitiveData({ password: '123', name: 'Jane' }, ['password']);
    expect(result).toEqual({ password: '[REDACTED]', name: 'Jane' });
  });

  it('masks matching RegExp keys', () => {
    const result = maskSensitiveData({ tokenA: 'x', tokenB: 'y', name: 'Jane' }, [/^token/]);
    expect(result).toEqual({ tokenA: '[REDACTED]', tokenB: '[REDACTED]', name: 'Jane' });
  });
});

describe('normalizeUrl', () => {
  it('replaces matching pattern', () => {
    const result = normalizeUrl('/users/123', [[/\/users\/\d+/, '/users/:id']]);
    expect(result).toBe('/users/:id');
  });

  it('returns original when no pattern matches', () => {
    const result = normalizeUrl('/about', [[/\/users\/\d+/, '/users/:id']]);
    expect(result).toBe('/about');
  });
});
