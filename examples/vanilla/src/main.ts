import { resolveError, type ErrorConfig, type ResolvedError } from '@huh/core';
import errorConfig from './huh.json';
import './style.css';

const config = errorConfig as ErrorConfig;
const container = document.getElementById('error-container')!;

function clearError() {
  container.innerHTML = '';
}

function renderToast(error: ResolvedError) {
  clearError();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = error.message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function renderModal(error: ResolvedError) {
  clearError();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const title = document.createElement('h2');
  title.textContent = error.title ?? '';

  const message = document.createElement('p');
  message.textContent = error.message;

  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn-secondary';
  dismissBtn.textContent = '닫기';
  dismissBtn.addEventListener('click', clearError);
  actions.appendChild(dismissBtn);

  if (error.action) {
    const actionBtn = document.createElement('button');
    actionBtn.textContent = error.action.label;
    actionBtn.addEventListener('click', () => {
      if (error.action!.type === 'REDIRECT' && error.action!.target) {
        alert(`Redirect → ${error.action!.target}`);
      }
      clearError();
    });
    actions.appendChild(actionBtn);
  }

  modal.append(title, message, actions);
  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) clearError();
  });
  container.appendChild(overlay);
}

function renderPage(error: ResolvedError) {
  clearError();
  const page = document.createElement('div');
  page.className = 'error-page';

  if (error.image) {
    const img = document.createElement('img');
    img.src = error.image;
    img.alt = '';
    page.appendChild(img);
  }

  const title = document.createElement('h1');
  title.textContent = error.title ?? '';
  page.appendChild(title);

  const message = document.createElement('p');
  message.textContent = error.message;
  page.appendChild(message);

  if (error.action) {
    const actionBtn = document.createElement('button');
    actionBtn.textContent = error.action.label;
    actionBtn.addEventListener('click', clearError);
    page.appendChild(actionBtn);
  }

  container.appendChild(page);
}

const renderers: Record<string, (error: ResolvedError) => void> = {
  TOAST: renderToast,
  MODAL: renderModal,
  PAGE: renderPage,
};

function huh(trackId: string, variables?: Record<string, string>) {
  const resolved = resolveError(config, trackId, variables);
  const render = renderers[resolved.type];
  if (render) render(resolved);
}

document.getElementById('btn-toast')!.addEventListener('click', () => {
  huh('ERR_NETWORK');
});

document.getElementById('btn-modal')!.addEventListener('click', () => {
  huh('ERR_AUTH', { userName: '홍길동' });
});

document.getElementById('btn-page')!.addEventListener('click', () => {
  huh('ERR_NOT_FOUND');
});
