import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';
import TestWrapper from './TestWrapper.svelte';
import ChildOnly from './ChildOnly.svelte';
import BadConsumer from './BadConsumer.svelte';
import ToastRenderer from './helpers/ToastRenderer.svelte';
import ModalRenderer from './helpers/ModalRenderer.svelte';
import PageRenderer from './helpers/PageRenderer.svelte';
import BannerRenderer from './helpers/BannerRenderer.svelte';
afterEach(() => {
    cleanup();
});
const testConfig = {
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
    ERR_REDIRECT: {
        type: 'PAGE',
        message: 'Redirecting',
        title: 'Redirect',
        action: {
            label: 'Go home',
            type: 'REDIRECT',
            target: '/home',
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
const mockRenderers = {
    TOAST: ToastRenderer,
    MODAL: ModalRenderer,
    PAGE: PageRenderer,
    BANNER: BannerRenderer,
};
describe('HuhProvider', () => {
    it('renders children', () => {
        render(ChildOnly, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        expect(screen.getByTestId('child')).toBeDefined();
    });
    it('renders toast error when huh is called', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        await fireEvent.click(screen.getByText('trigger toast'));
        expect(screen.getByTestId('toast')).toBeDefined();
        expect(screen.getByText('Something went wrong')).toBeDefined();
    });
    it('renders modal with variable substitution', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        await fireEvent.click(screen.getByText('trigger modal'));
        expect(screen.getByTestId('modal')).toBeDefined();
        expect(screen.getByText('Hello, 이재민!')).toBeDefined();
    });
    it('clears error on dismiss', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        await fireEvent.click(screen.getByText('trigger toast'));
        expect(screen.getByTestId('toast')).toBeDefined();
        await fireEvent.click(screen.getByText('clear'));
        expect(screen.queryByTestId('toast')).toBeNull();
    });
    it('calls onAction dismiss which clears state', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        await fireEvent.click(screen.getByText('trigger modal'));
        expect(screen.getByTestId('modal')).toBeDefined();
        await fireEvent.click(screen.getByText('Dismiss'));
        expect(screen.queryByTestId('modal')).toBeNull();
    });
    it('renders custom type with custom renderer', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        await fireEvent.click(screen.getByText('trigger custom'));
        expect(screen.getByTestId('banner')).toBeDefined();
        expect(screen.getByText('Custom banner error')).toBeDefined();
    });
    it('calls onCustomAction for custom action types', async () => {
        const onCustomAction = vi.fn();
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, onCustomAction },
        });
        await fireEvent.click(screen.getByText('trigger custom'));
        await fireEvent.click(screen.getByText('Open chat'));
        expect(onCustomAction).toHaveBeenCalledWith({ type: 'OPEN_CHAT', target: undefined });
        expect(screen.queryByTestId('banner')).toBeNull();
    });
});
describe('plugins', () => {
    it('calls onError when huh is called', async () => {
        const onError = vi.fn();
        const plugin = { name: 'test-plugin', onError };
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, plugins: [plugin] },
        });
        await fireEvent.click(screen.getByText('trigger toast'));
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ trackId: 'ERR_001', type: 'TOAST' }), expect.objectContaining({ trackId: 'ERR_001' }));
    });
    it('calls onAction when action is triggered', async () => {
        const onAction = vi.fn();
        const plugin = { name: 'test-plugin', onAction };
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, plugins: [plugin] },
        });
        await fireEvent.click(screen.getByText('trigger modal'));
        await fireEvent.click(screen.getByText('Dismiss'));
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ trackId: 'ERR_002' }), expect.objectContaining({ type: 'DISMISS' }));
    });
    it('renders normally even if plugin throws', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const plugin = {
            name: 'bad-plugin',
            onError: () => {
                throw new Error('plugin error');
            },
        };
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, plugins: [plugin] },
        });
        await fireEvent.click(screen.getByText('trigger toast'));
        expect(screen.getByTestId('toast')).toBeDefined();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
describe('huh', () => {
    it('maps error code to trackId via errorMap', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, errorMap: { API_500: 'ERR_001' } },
        });
        await fireEvent.click(screen.getByText('by-code'));
        expect(screen.getByTestId('toast')).toBeDefined();
        expect(screen.getByText('Something went wrong')).toBeDefined();
    });
    it('falls back to direct trackId match when no errorMap entry', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        await fireEvent.click(screen.getByText('direct-trackid'));
        expect(screen.getByTestId('toast')).toBeDefined();
    });
    it('uses fallbackTrackId when no mapping or direct match', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, fallbackTrackId: 'ERR_002' },
        });
        await fireEvent.click(screen.getByText('unknown-code'));
        expect(screen.getByTestId('modal')).toBeDefined();
    });
    it('throws when no mapping found and no fallback', async () => {
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers },
        });
        // In Svelte, errors thrown in event handlers become uncaught exceptions in jsdom.
        // We verify the error is thrown by catching it at the process level.
        let caughtError = null;
        const handler = (event) => {
            caughtError = event.error;
            event.preventDefault();
        };
        window.addEventListener('error', handler);
        await fireEvent.click(screen.getByText('unknown-code'));
        // The error is dispatched asynchronously via jsdom's reportException
        await new Promise((r) => setTimeout(r, 0));
        window.removeEventListener('error', handler);
        expect(caughtError).not.toBeNull();
        expect(caughtError.message).toContain('No mapping found for error code');
    });
});
describe('router prop', () => {
    it('calls router.push on REDIRECT action', async () => {
        const mockRouter = { push: vi.fn(), back: vi.fn() };
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, router: mockRouter },
        });
        await fireEvent.click(screen.getByText('trigger redirect'));
        await fireEvent.click(screen.getByText('Go home'));
        expect(mockRouter.push).toHaveBeenCalledWith('/home');
    });
    it('calls router.back on BACK action', async () => {
        const mockRouter = { push: vi.fn(), back: vi.fn() };
        render(TestWrapper, {
            props: { source: testConfig, renderers: mockRenderers, router: mockRouter },
        });
        await fireEvent.click(screen.getByText('trigger page'));
        await fireEvent.click(screen.getByText('Go back'));
        expect(mockRouter.back).toHaveBeenCalled();
    });
});
describe('useHuh', () => {
    it('throws when used outside provider', () => {
        expect(() => {
            render(BadConsumer);
        }).toThrow('useHuh must be used within');
    });
});
