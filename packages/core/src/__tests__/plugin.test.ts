import { describe, it, expect, vi } from 'vitest';
import { runPluginHook } from '../plugin';
import type { HuhPlugin } from '../schema';
import type { ResolvedError, ErrorAction } from '../schema';

const mockError: ResolvedError = {
  trackId: 'ERR_001',
  type: 'TOAST',
  message: 'Something went wrong',
};

const mockContext = {
  trackId: 'ERR_001',
  variables: { userName: 'Jane' },
  locale: 'en',
};

const mockAction: ErrorAction = {
  label: 'Retry',
  type: 'RETRY',
};

describe('runPluginHook', () => {
  it('calls onError on all plugins', () => {
    const onError1 = vi.fn();
    const onError2 = vi.fn();
    const plugins: HuhPlugin[] = [
      { name: 'plugin-1', onError: onError1 },
      { name: 'plugin-2', onError: onError2 },
    ];

    runPluginHook(plugins, 'onError', mockError, mockContext);

    expect(onError1).toHaveBeenCalledWith(mockError, mockContext);
    expect(onError2).toHaveBeenCalledWith(mockError, mockContext);
  });

  it('calls onAction on all plugins', () => {
    const onAction1 = vi.fn();
    const onAction2 = vi.fn();
    const plugins: HuhPlugin[] = [
      { name: 'plugin-1', onAction: onAction1 },
      { name: 'plugin-2', onAction: onAction2 },
    ];

    runPluginHook(plugins, 'onAction', mockError, mockAction);

    expect(onAction1).toHaveBeenCalledWith(mockError, mockAction);
    expect(onAction2).toHaveBeenCalledWith(mockError, mockAction);
  });

  it('skips plugins without the hook', () => {
    const onError = vi.fn();
    const plugins: HuhPlugin[] = [
      { name: 'no-hooks' },
      { name: 'has-hook', onError },
    ];

    runPluginHook(plugins, 'onError', mockError, mockContext);

    expect(onError).toHaveBeenCalledOnce();
  });

  it('catches errors from plugins and warns', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onError = vi.fn(() => {
      throw new Error('plugin error');
    });
    const onError2 = vi.fn();
    const plugins: HuhPlugin[] = [
      { name: 'bad-plugin', onError },
      { name: 'good-plugin', onError: onError2 },
    ];

    runPluginHook(plugins, 'onError', mockError, mockContext);

    expect(warnSpy).toHaveBeenCalledWith(
      '[huh] Plugin "bad-plugin" threw in onError:',
      expect.any(Error),
    );
    expect(onError2).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('handles empty plugin array', () => {
    expect(() => {
      runPluginHook([], 'onError', mockError, mockContext);
    }).not.toThrow();
  });
});
