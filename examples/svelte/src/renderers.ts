import type { RendererMap } from '@sanghyuk-2i/huh-svelte';
import Toast from './renderers/Toast.svelte';
import Modal from './renderers/Modal.svelte';
import Page from './renderers/Page.svelte';

export const renderers: RendererMap = {
  TOAST: Toast,
  MODAL: Modal,
  PAGE: Page,
};
