import { describe, it, expect, vi, beforeEach } from 'vitest';
import { datadogPlugin } from '../index';
import type { ResolvedError, ErrorAction, HuhErrorContext } from '@huh/core';

vi.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    logger: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    },
  },
}));

import { datadogLogs } from '@datadog/browser-logs';

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

describe('datadogPlugin', () => {
  it('returns a plugin with the correct name', () => {
    const plugin = datadogPlugin();
    expect(plugin.name).toBe('huh-datadog');
  });

  it('calls logger.error on onError by default', () => {
    const plugin = datadogPlugin();
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.error).toHaveBeenCalledWith(
      '[huh] ERR_001',
      expect.objectContaining({
        huh: expect.objectContaining({
          trackId: 'ERR_001',
          errorType: 'TOAST',
        }),
      }),
    );
  });

  it('includes locale in context', () => {
    const plugin = datadogPlugin();
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.error).toHaveBeenCalledWith(
      '[huh] ERR_001',
      expect.objectContaining({
        huh: expect.objectContaining({ locale: 'en' }),
      }),
    );
  });

  it('includes variables in context', () => {
    const plugin = datadogPlugin();
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.error).toHaveBeenCalledWith(
      '[huh] ERR_001',
      expect.objectContaining({
        huh: expect.objectContaining({ variables: { userName: 'Jane' } }),
      }),
    );
  });

  it('does not include locale when undefined', () => {
    const plugin = datadogPlugin();
    plugin.onError!(mockError, { trackId: 'ERR_001' });

    const call = (datadogLogs.logger.error as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].huh.locale).toBeUndefined();
  });

  it('does not include variables when undefined', () => {
    const plugin = datadogPlugin();
    plugin.onError!(mockError, { trackId: 'ERR_001' });

    const call = (datadogLogs.logger.error as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].huh.variables).toBeUndefined();
  });

  it('respects custom level option: warn', () => {
    const plugin = datadogPlugin({ level: 'warn' });
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.warn).toHaveBeenCalled();
    expect(datadogLogs.logger.error).not.toHaveBeenCalled();
  });

  it('respects custom level option: info', () => {
    const plugin = datadogPlugin({ level: 'info' });
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.info).toHaveBeenCalledWith('[huh] ERR_001', expect.any(Object));
  });

  it('respects custom level option: debug', () => {
    const plugin = datadogPlugin({ level: 'debug' });
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.debug).toHaveBeenCalled();
  });

  it('adds service to context when provided', () => {
    const plugin = datadogPlugin({ service: 'my-app' });
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.error).toHaveBeenCalledWith(
      '[huh] ERR_001',
      expect.objectContaining({ service: 'my-app' }),
    );
  });

  it('skips error when filter returns false', () => {
    const plugin = datadogPlugin({ filter: () => false });
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.error).not.toHaveBeenCalled();
  });

  it('reports error when filter returns true', () => {
    const plugin = datadogPlugin({ filter: () => true });
    plugin.onError!(mockError, mockContext);

    expect(datadogLogs.logger.error).toHaveBeenCalled();
  });

  it('logs action with logger.info on onAction', () => {
    const plugin = datadogPlugin();
    plugin.onAction!(mockError, mockAction);

    expect(datadogLogs.logger.info).toHaveBeenCalledWith(
      '[huh] Action "RETRY" on "ERR_001"',
      expect.objectContaining({
        huh: expect.objectContaining({
          trackId: 'ERR_001',
          errorType: 'TOAST',
          actionType: 'RETRY',
        }),
      }),
    );
  });

  it('includes target in action context when present', () => {
    const plugin = datadogPlugin();
    const actionWithTarget: ErrorAction = {
      label: 'Go',
      type: 'REDIRECT',
      target: '/login',
    };
    plugin.onAction!(mockError, actionWithTarget);

    expect(datadogLogs.logger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        huh: expect.objectContaining({ target: '/login' }),
      }),
    );
  });

  it('does not include target when absent', () => {
    const plugin = datadogPlugin();
    plugin.onAction!(mockError, mockAction);

    const call = (datadogLogs.logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].huh.target).toBeUndefined();
  });

  it('adds service to action context when provided', () => {
    const plugin = datadogPlugin({ service: 'my-app' });
    plugin.onAction!(mockError, mockAction);

    expect(datadogLogs.logger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ service: 'my-app' }),
    );
  });

  it('skips action tracking when actionTracking is false', () => {
    const plugin = datadogPlugin({ actionTracking: false });
    plugin.onAction!(mockError, mockAction);

    expect(datadogLogs.logger.info).not.toHaveBeenCalled();
  });
});
