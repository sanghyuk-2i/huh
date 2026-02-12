# @huh/react API

A React Context-based error UI rendering library. The Provider manages error state and displays error UI using user-provided custom renderers.

## Installation

```bash
pnpm add @huh/core @huh/react
```

**Peer Dependencies**: `react >= 18`, `react-dom >= 18`

---

## HuhProvider

Manages error state and invokes the appropriate type's renderer when an active error exists.

### Props

```ts
interface HuhProviderProps {
  source: ErrorConfig;       // JSON DSL data (core's ErrorConfig)
  renderers: RendererMap;    // Custom renderers (required)
  children: ReactNode;
  onRetry?: () => void;      // Callback invoked on RETRY action
  onCustomAction?: (action: { type: string; target?: string }) => void;  // Custom action callback
}
```

### Basic Usage

```tsx
import errorContent from './huh.json';
import { HuhProvider } from '@huh/react';

function App() {
  return (
    <HuhProvider
      source={errorContent}
      renderers={renderers}
      onRetry={() => window.location.reload()}
      onCustomAction={(action) => {
        // Handle custom action types (e.g., OPEN_CHAT, SHARE, etc.)
        if (action.type === 'OPEN_CHAT') openChatWidget();
      }}
    >
      <YourApp />
    </HuhProvider>
  );
}
```

---

## RendererMap

Provides renderers for each error type. There are no default renderers — if an error occurs and no renderer exists for that type, a runtime error will be thrown. Keys are uppercase type names.

```ts
type RendererMap = Record<string, (props: ErrorRenderProps) => ReactNode>;
```

In addition to built-in types (`TOAST`, `MODAL`, `PAGE`), renderers for custom types can be freely added:

```ts
const renderers: RendererMap = {
  TOAST: ({ error, onDismiss }) => <Toast message={error.message} onClose={onDismiss} />,
  MODAL: ({ error, onAction, onDismiss }) => <Modal ... />,
  PAGE: ({ error, onAction }) => <ErrorPage ... />,
  // Custom type renderers
  BANNER: ({ error, onAction, onDismiss }) => <Banner message={error.message} ... />,
  SNACKBAR: ({ error, onDismiss }) => <Snackbar message={error.message} ... />,
};
```

### ErrorRenderProps

Props passed to each renderer.

```ts
interface ErrorRenderProps {
  error: ResolvedError;    // Error info with variables already substituted
  onAction: () => void;    // Action button click handler
  onDismiss: () => void;   // Dismiss handler
}
```

- `error.type` — `'TOAST' | 'MODAL' | 'PAGE' | string` (includes custom types)
- `error.message` — Substituted message
- `error.title` — Substituted title (optional)
- `error.image` — Image URL (optional)
- `error.action` — Action info (optional)

### onAction Behavior

`onAction` behaves automatically based on the error's `action.type`:

| actionType | Behavior |
|------------|----------|
| `REDIRECT` | `window.location.href = action.target` |
| `BACK` | `window.history.back()` |
| `RETRY` | Clear error + invoke `onRetry` callback |
| `DISMISS` | Clear error |
| Custom type | Clear error + invoke `onCustomAction` callback |
| No action | Clear error |

Custom action types (e.g., `OPEN_CHAT`, `SHARE`) pass a `{ type, target }` object to the `onCustomAction` callback.

### Renderer Implementation Example

```tsx
import type { RendererMap } from '@huh/react';
import { Toast } from '@/components/Toast';
import { Modal } from '@/components/Modal';

const renderers: RendererMap = {
  TOAST: ({ error, onDismiss }) => (
    <Toast message={error.message} onClose={onDismiss} />
  ),

  MODAL: ({ error, onAction, onDismiss }) => (
    <Modal open onClose={onDismiss}>
      <Modal.Title>{error.title}</Modal.Title>
      <Modal.Body>{error.message}</Modal.Body>
      <Modal.Footer>
        {error.action && (
          <button onClick={onAction}>{error.action.label}</button>
        )}
        <button onClick={onDismiss}>Close</button>
      </Modal.Footer>
    </Modal>
  ),

  PAGE: ({ error, onAction }) => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error.image && <img src={error.image} alt="" className="w-48 mb-8" />}
      <h1 className="text-3xl font-bold">{error.title}</h1>
      <p className="mt-4 text-gray-600">{error.message}</p>
      {error.action && (
        <button onClick={onAction} className="mt-8 btn btn-primary">
          {error.action.label}
        </button>
      )}
    </div>
  ),

  // Custom type example
  BANNER: ({ error, onAction, onDismiss }) => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <p>{error.message}</p>
      {error.action && <button onClick={onAction}>{error.action.label}</button>}
      <button onClick={onDismiss}>Close</button>
    </div>
  ),
};
```

---

## useHuh

A hook for triggering or clearing errors from within the Provider tree.

```ts
function useHuh(): HuhContextValue;

interface HuhContextValue {
  handleError: (trackId: string, variables?: Record<string, string>) => void;
  clearError: () => void;
}
```

**Throws an error if called outside of the Provider.**

### handleError(trackId, variables?)

Looks up the error corresponding to `trackId`, substitutes variables, and displays the UI using the appropriate renderer.

```tsx
const { handleError } = useHuh();

// Simple error trigger
handleError('ERR_NETWORK');

// Trigger with variable substitution
handleError('ERR_SESSION_EXPIRED', { userName: 'Jane' });
```

### clearError()

Closes the currently active error UI.

```tsx
const { clearError } = useHuh();

clearError();
```

---

## Full Example

```tsx
import React from 'react';
import errorContent from './huh.json';
import { HuhProvider, useHuh } from '@huh/react';
import type { RendererMap } from '@huh/react';

const renderers: RendererMap = {
  TOAST: ({ error, onDismiss }) => (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded">
      {error.message}
      <button onClick={onDismiss} className="ml-2">X</button>
    </div>
  ),
  MODAL: ({ error, onAction, onDismiss }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold">{error.title}</h2>
        <p className="mt-2">{error.message}</p>
        <div className="mt-4 flex gap-2">
          {error.action && (
            <button onClick={onAction} className="btn-primary">
              {error.action.label}
            </button>
          )}
          <button onClick={onDismiss}>Close</button>
        </div>
      </div>
    </div>
  ),
  PAGE: ({ error, onAction }) => (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl">{error.title}</h1>
      <p className="mt-4">{error.message}</p>
      {error.action && (
        <button onClick={onAction} className="mt-8 btn-primary">
          {error.action.label}
        </button>
      )}
    </div>
  ),
};

function UserProfile() {
  const { handleError } = useHuh();

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error();
    } catch {
      handleError('ERR_PROFILE_LOAD');
    }
  };

  return <button onClick={loadProfile}>Load Profile</button>;
}

export default function App() {
  return (
    <HuhProvider
      source={errorContent}
      renderers={renderers}
      onRetry={() => console.log('Retrying...')}
    >
      <UserProfile />
    </HuhProvider>
  );
}
```
