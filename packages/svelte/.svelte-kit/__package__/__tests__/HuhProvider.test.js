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
    it('renders toast error when handleError is called', async () => {
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
    it('calls onError when handleError is called', async () => {
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
describe('useHuh', () => {
    it('throws when used outside provider', () => {
        expect(() => {
            render(BadConsumer);
        }).toThrow('useHuh must be used within');
    });
});
