---
title: '@sanghyuk-2i/huh-vue API'
description: 'Vue 3 provide/inject 기반 에러 UI 렌더링 - HuhProvider, useHuh, RendererMap'

---
Vue 3의 provide/inject 기반 에러 UI 렌더링 라이브러리입니다. Provider가 에러 상태를 관리하고, 사용자가 제공한 커스텀 렌더러로 에러 UI를 표시합니다.

## 설치

::: code-group

```bash [pnpm]
pnpm add @sanghyuk-2i/huh-core @sanghyuk-2i/huh-vue
```

```bash [npm]
npm install @sanghyuk-2i/huh-core @sanghyuk-2i/huh-vue
```

```bash [yarn]
yarn add @sanghyuk-2i/huh-core @sanghyuk-2i/huh-vue
```

:::

**Peer Dependencies**: `vue >= 3.3`

---
## HuhProvider

에러 상태를 관리하고, 활성 에러가 있을 때 해당 타입의 렌더러를 호출합니다. SFC가 아닌 순수 TypeScript render function 컴포넌트입니다.

### Props

```ts
interface HuhProviderProps {
  source?: ErrorConfig; // JSON DSL 데이터 (단일 언어 모드)
  locales?: LocalizedErrorConfig; // 다국어 에러 설정 (i18n 모드)
  defaultLocale?: string; // 기본 로케일
  locale?: string; // 현재 로케일 (외부 제어)
  renderers: RendererMap; // 커스텀 렌더러 (필수)
  onRetry?: () => void; // RETRY 액션 시 호출되는 콜백
  onCustomAction?: (action: { type: string; target?: string }) => void; // 커스텀 액션 콜백
  plugins?: HuhPlugin[]; // 모니터링/분석용 플러그인 배열
  errorMap?: Record<string, string>; // 에러 코드→trackId 매핑 테이블
  fallbackTrackId?: string; // 매핑이 없을 때 사용할 기본 trackId
  router?: HuhRouter; // 클라이언트 사이드 라우팅용 커스텀 라우터 (예: Nuxt useRouter)
}
```

::: tip
  `source`와 `locales` 중 하나를 제공해야 합니다. `source`는 기존 단일 언어 모드, `locales`는 다국어
  모드입니다.
:::

### 기본 사용법

```vue
<script setup lang="ts">
import { HuhProvider } from '@sanghyuk-2i/huh-vue';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
import errorContent from './huh.json';
import { renderers } from './renderers';

const config = errorContent as ErrorConfig;
</script>

<template>
  <HuhProvider
    :source="config"
    :renderers="renderers"
    :on-retry="() => window.location.reload()"
    :on-custom-action="
      (action) => {
        if (action.type === 'OPEN_CHAT') openChatWidget();
      }
    "
  >
    <YourApp />
  </HuhProvider>
</template>
```

### 라우터 연동

`router` prop을 전달하면 full page reload 대신 프레임워크별 클라이언트 사이드 네비게이션을 사용합니다:

```vue
<script setup lang="ts">
// Nuxt
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <HuhProvider
    :source="config"
    :renderers="renderers"
    :router="{ push: (url) => router.push(url), back: () => router.back() }"
  >
    <YourApp />
  </HuhProvider>
</template>
```

`router`가 제공되면 `REDIRECT` 액션은 `router.push()`를, `BACK` 액션은 `router.back()`을 사용합니다. 미제공 시 기존 `window.location.href` 및 `window.history.back()` 동작이 유지됩니다.

---
## RendererMap

에러 타입별 렌더러를 제공합니다. Vue Component 타입을 사용합니다. 키는 대문자 타입명입니다.

```ts type { Component } from 'vue';

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

React 패키지와 동일한 액션 처리 로직을 사용합니다:

| actionType  | 동작                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| `REDIRECT`  | `router` 제공 시 `router.push(target)`, 미제공 시 `window.location.href = target` |
| `BACK`      | `router` 제공 시 `router.back()`, 미제공 시 `window.history.back()`               |
| `RETRY`     | 에러 클리어 + `onRetry` 콜백 호출                                                 |
| `DISMISS`   | 에러 클리어                                                                       |
| 커스텀 타입 | 에러 클리어 + `onCustomAction` 콜백 호출                                          |

### 렌더러 구현 예시

`defineComponent` + `h` 함수로 렌더러를 구현합니다 (SFC 컴파일러 불필요):

```ts
const { defineComponent, h } from 'vue';
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
            h('button', { onClick: props.onDismiss }, '닫기'),
            props.error.action &&
              h('button', { onClick: props.onAction }, props.error.action.label),
          ]),
        ]),
      ]);
  },
});

export const renderers: RendererMap = {
  TOAST: Toast,
  MODAL: Modal,
};
```

---
## useHuh

Provider 하위에서 에러를 트리거하거나 클리어하는 composable입니다. Vue의 `inject()`를 내부적으로 사용합니다.

```ts [function] useHuh(): HuhContextValue;

interface HuhContextValue {
  huh: (code: string, variables?: Record<string, string>) => void;
  clearError: () => void;
  locale: string | undefined; // 현재 로케일 (i18n 모드)
  setLocale: (locale: string) => void; // 로케일 변경 (i18n 모드)
}
```

::: warning
Provider 밖에서 호출하면 에러가 발생합니다.
:::

### huh(code, variables?)

에러를 트리거하는 단일 함수입니다. trackId 직접 지정, errorMap 매핑, fallback을 모두 처리합니다.

**조회 순서:**

1. `errorMap`에서 코드 매핑 확인
2. 코드가 직접 trackId와 일치하는지 확인
3. `fallbackTrackId` 사용
4. 매핑이 없으면 에러 throw

```vue
<script setup lang="ts">
import { useHuh } from '@sanghyuk-2i/huh-vue';

const { huh } = useHuh();

// trackId로 직접 에러 트리거
huh('ERR_NETWORK');

// 변수 치환과 함께 트리거
huh('ERR_SESSION_EXPIRED', { userName: '홍길동' });

// API 에러 코드를 errorMap으로 매핑
async function callApi() {
  try {
    await api.call();
  } catch (e) {
    huh(e.code); // 'API_500' → errorMap → 'ERR_SERVER'
  }
}
</script>
```

**errorMap 설정:**

```vue
<HuhProvider
  :source="config"
  :renderers="renderers"
  :error-map="{ API_500: 'ERR_SERVER', API_401: 'ERR_AUTH' }"
  fallback-track-id="ERR_UNKNOWN"
>
  <App />
</HuhProvider>
```

### clearError()

현재 활성화된 에러 UI를 닫습니다.

```vue
<script setup lang="ts">
import { useHuh } from '@sanghyuk-2i/huh-vue';

const { clearError } = useHuh();
</script>

<template>
  <button @click="clearError()">에러 닫기</button>
</template>
```

---
## React 패키지와의 차이점

|                  | @sanghyuk-2i/huh-react                   | @sanghyuk-2i/huh-vue                                |
| ---------------- | ---------------------------- | --------------------------------------- |
| **상태 관리**    | `useState`                   | `ref()`                                 |
| **컨텍스트**     | `createContext`/`useContext` | `provide()`/`inject()` + `InjectionKey` |
| **렌더러 타입**  | `(props) => ReactNode`       | `Component<ErrorRenderProps>`           |
| **빌드**         | tsup (CJS + ESM)             | tsup (CJS + ESM)                        |
| **"use client"** | 필요 (Next.js)               | 불필요                                  |
