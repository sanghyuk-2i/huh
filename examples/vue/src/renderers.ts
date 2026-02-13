import { defineComponent, h } from 'vue';
import type { RendererMap } from '@sanghyuk-2i/huh-vue';

const Toast = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () => h('div', { class: 'toast', onClick: props.onDismiss }, props.error.message);
  },
});

const Modal = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'modal-overlay', onClick: props.onDismiss }, [
        h('div', { class: 'modal', onClick: (e: Event) => e.stopPropagation() }, [
          h('h2', props.error.title),
          h('p', props.error.message),
          h('div', { class: 'modal-actions' }, [
            h('button', { class: 'btn-secondary', onClick: props.onDismiss }, '닫기'),
            props.error.action &&
              h('button', { onClick: props.onAction }, props.error.action.label),
          ]),
        ]),
      ]);
  },
});

const Page = defineComponent({
  props: {
    error: { type: Object, required: true },
    onAction: { type: Function, required: true },
    onDismiss: { type: Function, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'error-page' }, [
        props.error.image && h('img', { src: props.error.image, alt: '' }),
        h('h1', props.error.title),
        h('p', props.error.message),
        props.error.action && h('button', { onClick: props.onAction }, props.error.action.label),
      ]);
  },
});

export const renderers: RendererMap = {
  TOAST: Toast,
  MODAL: Modal,
  PAGE: Page,
};
