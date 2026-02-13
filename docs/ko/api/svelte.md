---
title: '@sanghyuk-2i/huh-svelte API'
description: 'Svelte 5 context 기반 에러 UI 렌더링 - HuhProvider, useHuh, RendererMap'

---
Svelte 5의 setContext/getContext 기반 에러 UI 렌더링 라이브러리입니다. Provider가 에러 상태를 관리하고, 사용자가 제공한 커스텀 렌더러로 에러 UI를 표시합니다. Svelte 5 runes (`$state`, `$props`, `$derived`)를 사용합니다.

## 설치

::: code-group

```bash [pnpm]
pnpm add @sanghyuk-2i/huh-core @sanghyuk-2i/huh-svelte
```

```bash [npm]
npm install @sanghyuk-2i/huh-core @sanghyuk-2i/huh-svelte
```

```bash [yarn]
yarn add @sanghyuk-2i/huh-core @sanghyuk-2i/huh-svelte
```

:::

**Peer Dependencies**: `svelte >= 5.0.0`

---
## HuhProvider

에러 상태를 관리하고, 활성 에러가 있을 때 해당 타입의 렌더러를 동적 컴포넌트로 렌더링합니다.

### Props

```ts
interface Props {
  source?: ErrorConfig; // JSON DSL 데이터 (단일 언어 모드)
  locales?: LocalizedErrorConfig; // 다국어 에러 설정 (i18n 모드)
  defaultLocale?: string; // 기본 로케일
  locale?: string; // 현재 로케일 (외부 제어)
  renderers: RendererMap; // 커스텀 렌더러 (필수)
  children: Snippet; // 자식 컴포넌트
  onRetry?: () => void; // RETRY 액션 시 호출되는 콜백
  onCustomAction?: (action: { type: string; target?: string }) => void; // 커스텀 액션 콜백
  plugins?: HuhPlugin[]; // 모니터링/분석용 플러그인 배열
  errorMap?: Record<string, string>; // 에러 코드→trackId 매핑 테이블
  fallbackTrackId?: string; // 매핑이 없을 때 사용할 기본 trackId
  router?: HuhRouter; // 클라이언트 사이드 라우팅용 커스텀 라우터 (예: SvelteKit goto)
}
```

::: tip
  `source`와 `locales` 중 하나를 제공해야 합니다. `source`는 기존 단일 언어 모드, `locales`는 다국어
  모드입니다.
:::

### 기본 사용법

```svelte
<script lang="ts">
  import { HuhProvider } from '@sanghyuk-2i/huh-svelte';
  import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
  import errorContent from './huh.json';
  import { renderers } from './renderers';

  const config = errorContent as ErrorConfig;
</script>

<HuhProvider
  source={config}
  {renderers}
  onRetry={() => window.location.reload()}
  onCustomAction={(action) => {
    if (action.type === 'OPEN_CHAT') openChatWidget();
  }}
>
  <YourApp />
</HuhProvider>
```

### 라우터 연동

`router` prop을 전달하면 full page reload 대신 프레임워크별 클라이언트 사이드 네비게이션을 사용합니다:

```svelte
<script lang="ts">
  // SvelteKit
  import { goto } from '$app/navigation';
  import { HuhProvider } from '@sanghyuk-2i/huh-svelte';
</script>

<HuhProvider
  {source}
  {renderers}
  router={{ push: goto, back: () => history.back() }}
>
  <YourApp />
</HuhProvider>
```

`router`가 제공되면 `REDIRECT` 액션은 `router.push()`를, `BACK` 액션은 `router.back()`을 사용합니다. 미제공 시 기존 `window.location.href` 및 `window.history.back()` 동작이 유지됩니다.

---
## RendererMap

에러 타입별 렌더러를 제공합니다. Svelte 5 Component 타입을 사용합니다. 키는 대문자 타입명입니다.

```ts type { Component } from 'svelte';

type RendererMap = Record<string, Component<ErrorRenderProps>>;
```

### ErrorRenderProps

각 렌더러에 전달되는 props입니다.

```ts
interface ErrorRenderProps {
  error: ResolvedError; // 변수 치환이 완료된 에러 정보
  onAction: () => void; // 액션 버튼 클릭 핸들러
  onDismiss: () => void; // 닫기 핸들러
}
```

### onAction 동작

React/Vue 패키지와 동일한 액션 처리 로직을 사용합니다:

| actionType  | 동작                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| `REDIRECT`  | `router` 제공 시 `router.push(target)`, 미제공 시 `window.location.href = target` |
| `BACK`      | `router` 제공 시 `router.back()`, 미제공 시 `window.history.back()`               |
| `RETRY`     | 에러 클리어 + `onRetry` 콜백 호출                                                 |
| `DISMISS`   | 에러 클리어                                                                       |
| 커스텀 타입 | 에러 클리어 + `onCustomAction` 콜백 호출                                          |

### 렌더러 구현 예시

Svelte 컴포넌트로 렌더러를 구현합니다:

```svelte
<!-- Toast.svelte -->
<script lang="ts">
  import type { ResolvedError } from '@sanghyuk-2i/huh-core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onDismiss }: Props = $props();
</script>

<div class="toast" onclick={onDismiss} role="alert">
  {error.message}
</div>
```

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  import type { ResolvedError } from '@sanghyuk-2i/huh-core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction, onDismiss }: Props = $props();
</script>

<div class="modal-overlay" onclick={onDismiss} role="dialog" tabindex="-1">
  <div class="modal" onclick={(e) => e.stopPropagation()} role="document">
    <h2>{error.title}</h2>
    <p>{error.message}</p>
    <div class="modal-actions">
      <button onclick={onDismiss}>닫기</button>
      {#if error.action}
        <button onclick={onAction}>{error.action.label}</button>
      {/if}
    </div>
  </div>
</div>
```

렌더러를 `RendererMap`으로 조합합니다:

```ts type { RendererMap } from '@sanghyuk-2i/huh-svelte';
import Toast from './renderers/Toast.svelte';
import Modal from './renderers/Modal.svelte';
import Page from './renderers/Page.svelte';

export const renderers: RendererMap = {
  TOAST: Toast,
  MODAL: Modal,
  PAGE: Page,
};
```

---
## useHuh

Provider 하위에서 에러를 트리거하거나 클리어하는 함수입니다. Svelte의 `getContext()`를 내부적으로 사용합니다.

```ts [function] useHuh(): HuhContextValue;

interface HuhContextValue {
  huh: (code: string, variables?: Record<string, string>) => void;
  clearError: () => void;
  locale: string | undefined; // 현재 로케일 (i18n 모드)
  setLocale: (locale: string) => void; // 로케일 변경 (i18n 모드)
}
```

::: warning
Provider 밖에서 호출하면 에러가 발생합니다. 반드시 컴포넌트 초기화 시점 (최상위 `<script>` 블록) 에서 호출해야 합니다.
:::

### huh(code, variables?)

에러를 트리거하는 단일 함수입니다. trackId 직접 지정, errorMap 매핑, fallback을 모두 처리합니다.

**조회 순서:**

1. `errorMap`에서 코드 매핑 확인
2. 코드가 직접 trackId와 일치하는지 확인
3. `fallbackTrackId` 사용
4. 매핑이 없으면 에러 throw

```svelte
<script lang="ts">
  import { useHuh } from '@sanghyuk-2i/huh-svelte';

  const { huh } = useHuh();
</script>

<!-- trackId로 직접 에러 트리거 -->
<button onclick={() => huh('ERR_NETWORK')}>에러 트리거</button>
<button onclick={() => huh('ERR_AUTH', { userName: '홍길동' })}>변수 치환</button>
```

**errorMap 설정:**

```svelte
<HuhProvider
  {source}
  {renderers}
  errorMap={{ 'API_500': 'ERR_SERVER', 'API_401': 'ERR_AUTH' }}
  fallbackTrackId="ERR_UNKNOWN"
>
  <App />
</HuhProvider>

<!-- API 에러 코드를 errorMap으로 매핑 -->
<script>
  const { huh } = useHuh();

  async function callApi() {
    try {
      await api.call();
    } catch (e) {
      huh(e.code);  // 'API_500' → errorMap → 'ERR_SERVER'
    }
  }
</script>
```

### clearError()

현재 활성화된 에러 UI를 닫습니다.

```svelte
<script lang="ts">
  import { useHuh } from '@sanghyuk-2i/huh-svelte';

  const { clearError } = useHuh();
</script>

<button onclick={() => clearError()}>에러 닫기</button>
```

---
## 빌드 설정

`@sanghyuk-2i/huh-svelte`는 `svelte-package`로 빌드됩니다. tsup이 아닌 Svelte 라이브러리 표준 빌드 도구를 사용합니다.

- **출력**: ESM only (`"type": "module"`)
- **exports**: `"svelte"` 조건 포함
- **files**: `dist` + `src` (IDE 툴링을 위한 소스 포함)

---
## React 패키지와의 차이점

|                 | @sanghyuk-2i/huh-react                   | @sanghyuk-2i/huh-svelte                                     |
| --------------- | ---------------------------- | ----------------------------------------------- |
| **상태 관리**   | `useState`                   | `$state()`                                      |
| **컨텍스트**    | `createContext`/`useContext` | `setContext()`/`getContext()` + Symbol          |
| **렌더러 타입** | `(props) => ReactNode`       | `Component<ErrorRenderProps>` (Svelte 컴포넌트) |
| **children**    | `ReactNode`                  | `Snippet`                                       |
| **빌드**        | tsup (CJS + ESM)             | svelte-package (ESM)                            |
