'use client';

import type { RendererMap } from '@huh/react';

export const renderers: RendererMap = {
  TOAST: ({ error, onDismiss }) => (
    <div className="toast" onClick={onDismiss}>
      {error.message}
    </div>
  ),

  MODAL: ({ error, onAction, onDismiss }) => (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{error.title}</h2>
        <p>{error.message}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onDismiss}>
            닫기
          </button>
          {error.action && <button onClick={onAction}>{error.action.label}</button>}
        </div>
      </div>
    </div>
  ),

  PAGE: ({ error, onAction }) => (
    <div className="error-page">
      {error.image && <img src={error.image} alt="" />}
      <h1>{error.title}</h1>
      <p>{error.message}</p>
      {error.action && <button onClick={onAction}>{error.action.label}</button>}
    </div>
  ),
};
