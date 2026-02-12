import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { HuhProvider } from '../ErrorContentProvider';
import { useHuh } from '../useErrorContent';
import type { ErrorConfig } from '@huh/core';
import type { RendererMap, ErrorRenderProps } from '../types';

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

const ToastRenderer = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'toast' }, [
        h('span', props.error.message),
        h('button', { onClick: props.onDismiss }, 'close'),
      ]);
  },
});

const ModalRenderer = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'modal' }, [
        h('h2', props.error.title),
        h('span', props.error.message),
        h('button', { onClick: props.onAction }, props.error.action?.label),
        h('button', { onClick: props.onDismiss }, 'close'),
      ]);
  },
});

const PageRenderer = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'page' }, [
        h('h1', props.error.title),
        h('span', props.error.message),
        h('button', { onClick: props.onAction }, props.error.action?.label),
      ]);
  },
});

const BannerRenderer = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'banner' }, [
        h('span', props.error.message),
        h('button', { onClick: props.onAction }, props.error.action?.label),
        h('button', { onClick: props.onDismiss }, 'close'),
      ]);
  },
});

const mockRenderers: RendererMap = {
  TOAST: ToastRenderer,
  MODAL: ModalRenderer,
  PAGE: PageRenderer,
  BANNER: BannerRenderer,
};

const TestConsumer = defineComponent({
  setup() {
    const { handleError, clearError } = useHuh();
    return () =>
      h('div', [
        h('button', { onClick: () => handleError('ERR_001') }, 'trigger toast'),
        h(
          'button',
          { onClick: () => handleError('ERR_002', { userName: '이재민' }) },
          'trigger modal',
        ),
        h('button', { onClick: () => handleError('ERR_003') }, 'trigger page'),
        h('button', { onClick: () => handleError('ERR_CUSTOM') }, 'trigger custom'),
        h('button', { onClick: () => clearError() }, 'clear'),
      ]);
  },
});

describe('HuhProvider', () => {
  it('renders children', () => {
    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers },
      slots: {
        default: () => h('div', { 'data-testid': 'child' }, 'Hello'),
      },
    });
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true);
  });

  it('renders toast error when handleError is called', async () => {
    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    await wrapper.findAll('button').filter((b) => b.text() === 'trigger toast')[0].trigger('click');
    expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Something went wrong');
  });

  it('renders modal with variable substitution', async () => {
    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    await wrapper.findAll('button').filter((b) => b.text() === 'trigger modal')[0].trigger('click');
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Hello, 이재민!');
  });

  it('clears error on dismiss', async () => {
    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    await wrapper.findAll('button').filter((b) => b.text() === 'trigger toast')[0].trigger('click');
    expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true);

    await wrapper.findAll('button').filter((b) => b.text() === 'clear')[0].trigger('click');
    expect(wrapper.find('[data-testid="toast"]').exists()).toBe(false);
  });

  it('calls onAction dismiss which clears state', async () => {
    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    await wrapper.findAll('button').filter((b) => b.text() === 'trigger modal')[0].trigger('click');
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);

    await wrapper.findAll('button').filter((b) => b.text() === 'Dismiss')[0].trigger('click');
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
  });

  it('renders custom type with custom renderer', async () => {
    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    await wrapper
      .findAll('button')
      .filter((b) => b.text() === 'trigger custom')[0]
      .trigger('click');
    expect(wrapper.find('[data-testid="banner"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Custom banner error');
  });

  it('calls onCustomAction for custom action types', async () => {
    const onCustomAction = vi.fn();

    const wrapper = mount(HuhProvider, {
      props: { source: testConfig, renderers: mockRenderers, onCustomAction },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    await wrapper
      .findAll('button')
      .filter((b) => b.text() === 'trigger custom')[0]
      .trigger('click');

    await wrapper.findAll('button').filter((b) => b.text() === 'Open chat')[0].trigger('click');

    expect(onCustomAction).toHaveBeenCalledWith({ type: 'OPEN_CHAT', target: undefined });
    expect(wrapper.find('[data-testid="banner"]').exists()).toBe(false);
  });
});

describe('useHuh', () => {
  it('throws when used outside provider', () => {
    const BadConsumer = defineComponent({
      setup() {
        useHuh();
        return () => null;
      },
    });

    expect(() => {
      mount(BadConsumer);
    }).toThrow('useHuh must be used within');
  });
});
