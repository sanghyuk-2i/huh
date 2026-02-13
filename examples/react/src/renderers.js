import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export const renderers = {
  TOAST: ({ error, onDismiss }) =>
    _jsx('div', { className: 'toast', onClick: onDismiss, children: error.message }),
  MODAL: ({ error, onAction, onDismiss }) =>
    _jsx('div', {
      className: 'modal-overlay',
      onClick: onDismiss,
      children: _jsxs('div', {
        className: 'modal',
        onClick: (e) => e.stopPropagation(),
        children: [
          _jsx('h2', { children: error.title }),
          _jsx('p', { children: error.message }),
          _jsxs('div', {
            className: 'modal-actions',
            children: [
              _jsx('button', {
                className: 'btn-secondary',
                onClick: onDismiss,
                children: '\uB2EB\uAE30',
              }),
              error.action && _jsx('button', { onClick: onAction, children: error.action.label }),
            ],
          }),
        ],
      }),
    }),
  PAGE: ({ error, onAction }) =>
    _jsxs('div', {
      className: 'error-page',
      children: [
        error.image && _jsx('img', { src: error.image, alt: '' }),
        _jsx('h1', { children: error.title }),
        _jsx('p', { children: error.message }),
        error.action && _jsx('button', { onClick: onAction, children: error.action.label }),
      ],
    }),
};
