import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { HuhProvider } from '../ErrorContentProvider';
import { useHuh } from '../useErrorContent';
import type { ErrorConfig, HuhPlugin } from '@huh/core';
import type { RendererMap, ErrorRenderProps } from '../types';

afterEach(() => {
  cleanup();
});

const testConfig: ErrorConfig = {
  ERR_001: {
    type: 'TOAST',
    message: 'Something went wrong',
  },
  ERR_002: {
    type: 'MODAL',
    message: 'Hello, {{userName}}!',
    title: 'Error',
    action: {
      label: 'Dismiss',
      type: 'DISMISS',
    },
  },
  ERR_003: {
    type: 'PAGE',
    message: 'Page not found',
    title: '404',
    action: {
      label: 'Go back',
      type: 'BACK',
    },
  },
  ERR_CUSTOM: {
    type: 'BANNER',
    message: 'Custom banner error',
    action: {
      label: 'Open chat',
      type: 'OPEN_CHAT',
    },
  },
};

const mockRenderers: RendererMap = {
  TOAST: ({ error, onDismiss }: ErrorRenderProps) => (
    <div data-testid="toast">
      <span>{error.message}</span>
      <button onClick={onDismiss}>close</button>
    </div>
  ),
  MODAL: ({ error, onAction, onDismiss }: ErrorRenderProps) => (
    <div data-testid="modal">
      <h2>{error.title}</h2>
      <span>{error.message}</span>
      <button onClick={onAction}>{error.action?.label}</button>
      <button onClick={onDismiss}>close</button>
    </div>
  ),
  PAGE: ({ error, onAction }: ErrorRenderProps) => (
    <div data-testid="page">
      <h1>{error.title}</h1>
      <span>{error.message}</span>
      <button onClick={onAction}>{error.action?.label}</button>
    </div>
  ),
  BANNER: ({ error, onAction, onDismiss }: ErrorRenderProps) => (
    <div data-testid="banner">
      <span>{error.message}</span>
      <button onClick={onAction}>{error.action?.label}</button>
      <button onClick={onDismiss}>close</button>
    </div>
  ),
};

function TestConsumer() {
  const { handleError, clearError } = useHuh();
  return (
    <div>
      <button onClick={() => handleError('ERR_001')}>trigger toast</button>
      <button onClick={() => handleError('ERR_002', { userName: '이재민' })}>
        trigger modal
      </button>
      <button onClick={() => handleError('ERR_003')}>trigger page</button>
      <button onClick={() => handleError('ERR_CUSTOM')}>trigger custom</button>
      <button onClick={() => clearError()}>clear</button>
    </div>
  );
}

describe('HuhProvider', () => {
  it('renders children', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <div data-testid="child">Hello</div>
      </HuhProvider>,
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('renders toast error when handleError is called', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger toast').click();
    });

    expect(screen.getByTestId('toast')).toBeDefined();
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('renders modal with variable substitution', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger modal').click();
    });

    expect(screen.getByTestId('modal')).toBeDefined();
    expect(screen.getByText('Hello, 이재민!')).toBeDefined();
  });

  it('clears error on dismiss', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger toast').click();
    });
    expect(screen.getByTestId('toast')).toBeDefined();

    act(() => {
      screen.getByText('clear').click();
    });
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('calls onAction dismiss which clears state', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger modal').click();
    });
    expect(screen.getByTestId('modal')).toBeDefined();

    act(() => {
      screen.getByText('Dismiss').click();
    });
    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('renders custom type with custom renderer', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger custom').click();
    });

    expect(screen.getByTestId('banner')).toBeDefined();
    expect(screen.getByText('Custom banner error')).toBeDefined();
  });

  it('calls onCustomAction for custom action types', () => {
    const onCustomAction = vi.fn();

    render(
      <HuhProvider
        source={testConfig}
        renderers={mockRenderers}
        onCustomAction={onCustomAction}
      >
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger custom').click();
    });

    act(() => {
      screen.getByText('Open chat').click();
    });

    expect(onCustomAction).toHaveBeenCalledWith({ type: 'OPEN_CHAT', target: undefined });
    expect(screen.queryByTestId('banner')).toBeNull();
  });
});

describe('plugins', () => {
  it('calls onError when handleError is called', () => {
    const onError = vi.fn();
    const plugin: HuhPlugin = { name: 'test-plugin', onError };

    render(
      <HuhProvider source={testConfig} renderers={mockRenderers} plugins={[plugin]}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger toast').click();
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: 'ERR_001', type: 'TOAST' }),
      expect.objectContaining({ trackId: 'ERR_001' }),
    );
  });

  it('calls onAction when action is triggered', () => {
    const onAction = vi.fn();
    const plugin: HuhPlugin = { name: 'test-plugin', onAction };

    render(
      <HuhProvider source={testConfig} renderers={mockRenderers} plugins={[plugin]}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger modal').click();
    });

    act(() => {
      screen.getByText('Dismiss').click();
    });

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: 'ERR_002' }),
      expect.objectContaining({ type: 'DISMISS' }),
    );
  });

  it('renders normally even if plugin throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plugin: HuhPlugin = {
      name: 'bad-plugin',
      onError: () => {
        throw new Error('plugin error');
      },
    };

    render(
      <HuhProvider source={testConfig} renderers={mockRenderers} plugins={[plugin]}>
        <TestConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('trigger toast').click();
    });

    expect(screen.getByTestId('toast')).toBeDefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('handleErrorByCode', () => {
  function CodeConsumer() {
    const { handleErrorByCode } = useHuh();
    return (
      <div>
        <button onClick={() => handleErrorByCode('API_500')}>by-code</button>
        <button onClick={() => handleErrorByCode('ERR_001')}>direct-trackid</button>
        <button onClick={() => handleErrorByCode('UNKNOWN_CODE')}>unknown-code</button>
      </div>
    );
  }

  it('maps error code to trackId via errorMap', () => {
    render(
      <HuhProvider
        source={testConfig}
        renderers={mockRenderers}
        errorMap={{ API_500: 'ERR_001' }}
      >
        <CodeConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('by-code').click();
    });

    expect(screen.getByTestId('toast')).toBeDefined();
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('falls back to direct trackId match when no errorMap entry', () => {
    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <CodeConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('direct-trackid').click();
    });

    expect(screen.getByTestId('toast')).toBeDefined();
  });

  it('uses fallbackTrackId when no mapping or direct match', () => {
    render(
      <HuhProvider
        source={testConfig}
        renderers={mockRenderers}
        fallbackTrackId="ERR_002"
      >
        <CodeConsumer />
      </HuhProvider>,
    );

    act(() => {
      screen.getByText('unknown-code').click();
    });

    expect(screen.getByTestId('modal')).toBeDefined();
  });

  it('throws when no mapping found and no fallback', () => {
    let capturedHandleErrorByCode: ((code: string) => void) | null = null;

    function CaptureConsumer() {
      const { handleErrorByCode } = useHuh();
      capturedHandleErrorByCode = handleErrorByCode;
      return null;
    }

    render(
      <HuhProvider source={testConfig} renderers={mockRenderers}>
        <CaptureConsumer />
      </HuhProvider>,
    );

    expect(capturedHandleErrorByCode).not.toBeNull();
    expect(() => capturedHandleErrorByCode!('UNKNOWN_CODE')).toThrow(
      'No mapping found for error code',
    );
  });
});

describe('useHuh', () => {
  it('throws when used outside provider', () => {
    function BadConsumer() {
      useHuh();
      return null;
    }

    expect(() => {
      render(<BadConsumer />);
    }).toThrow('useHuh must be used within');
  });
});
