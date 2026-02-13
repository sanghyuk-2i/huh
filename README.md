<div align="center">

<br />

<img src="https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png" width="80" />

# Huh (엥?)

**에러 메시지는 코드가 아니라 스프레드시트에서 관리하세요.**

비개발자는 Google Sheets, Airtable, Notion 등에서 에러 콘텐츠를 관리하고,
개발자는 타입 안전한 에러 UI를 자동으로 렌더링합니다.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

[시작하기](./docs/ko/getting-started.mdx) | [API 레퍼런스](./docs/ko/api/core.mdx) | [아키텍처](./docs/ko/architecture.mdx)

**[English / 영어](./README.en.md)**

</div>

---

## 이런 문제를 겪고 있지 않나요?

모든 프론트엔드 팀은 결국 에러 메시지가 코드베이스 여기저기에 흩어지는 문제를 겪습니다. 기획자가 문구 변경을 요청하면 티켓을 만들고, 개발자가 코드를 수정하고, 배포까지 기다려야 합니다. 에러 처리 로직은 컴포넌트마다 제각각입니다. 진실의 원천(Single Source of Truth)이 없습니다.

**Huh**는 외부 데이터 소스를 에러 콘텐츠의 단일 진실 원천으로 만들어 이 문제를 해결합니다:

```
데이터 소스 (기획자가 수정) → huh pull → huh.json → 런타임 UI
```

> Google Sheets, Airtable, Notion, CSV, XLSX를 지원합니다.

## 어떻게 동작하나요?

```
 +-----------------+       +-------------+       +------------------+
 |   데이터 소스     | pull  |  huh.json   | build |   Your App       |
 |                 |------>|  (JSON DSL) |------>|                  |
 |  기획자/PM 관리   |       |  타입 안전    |       |  자동 에러 UI 렌더 |
 +-----------------+       +-------------+       +------------------+
```

> 데이터 소스: Google Sheets · Airtable · Notion · CSV · XLSX

**데이터 소스는 이렇게 생겼습니다:**

| trackId       | type  | message                                 | title     | action                   |
| ------------- | ----- | --------------------------------------- | --------- | ------------------------ |
| ERR_NETWORK   | toast | 네트워크 연결이 불안정합니다.           |           |                          |
| ERR_AUTH      | modal | {{userName}}님의 인증이 만료되었습니다. | 인증 만료 | 로그인 → redirect:/login |
| ERR_NOT_FOUND | page  | 요청하신 페이지가 존재하지 않습니다.    | 404       | 돌아가기 → back          |

**코드는 이것만 작성하면 됩니다:**

```tsx
const { huh } = useHuh();

// trackId로 직접 에러 트리거
huh('ERR_AUTH', { userName: '홍길동' });

// API 에러 코드를 trackId로 매핑하여 트리거
huh(e.code); // 'API_500' → errorMap → 'ERR_SERVER'
```

## 빠른 시작

### 1. 설치

```bash
# React
npm install @sanghyuk-2i/huh-core @sanghyuk-2i/huh-react

# Vue
npm install @sanghyuk-2i/huh-core @sanghyuk-2i/huh-vue

# Svelte
npm install @sanghyuk-2i/huh-core @sanghyuk-2i/huh-svelte
```

#### CDN (번들러 없이 사용)

```html
<script src="https://unpkg.com/@sanghyuk-2i/huh-core"></script>
<!-- window.HuhCore 로 모든 API 사용 가능 -->
```

### 2. 데이터 소스에서 에러 콘텐츠 가져오기

```bash
npx huh init          # .huh.config.ts 생성 (데이터 소스 선택)
npx huh pull          # 데이터 소스 → huh.json 변환
```

### 3. 앱에 Provider 설정

```tsx
import errorContent from './huh.json';
import { HuhProvider, useHuh } from '@sanghyuk-2i/huh-react';

const renderers = {
  toast: ({ error, onDismiss }) => (
    <div className="toast" onClick={onDismiss}>
      {error.message}
    </div>
  ),
  modal: ({ error, onAction, onDismiss }) => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{error.title}</h2>
        <p>{error.message}</p>
        <button onClick={onAction}>{error.action?.label}</button>
        <button onClick={onDismiss}>닫기</button>
      </div>
    </div>
  ),
  page: ({ error, onAction }) => (
    <div className="error-page">
      {error.image && <img src={error.image} />}
      <h1>{error.title}</h1>
      <p>{error.message}</p>
      <button onClick={onAction}>{error.action?.label}</button>
    </div>
  ),
};

function App() {
  return (
    <HuhProvider source={errorContent} renderers={renderers}>
      <MyPage />
    </HuhProvider>
  );
}
```

### 4. 어디서든 에러 처리

```tsx
function MyPage() {
  const { huh } = useHuh();

  const fetchData = async () => {
    try {
      await api.getData();
    } catch (e) {
      // trackId로 직접 트리거
      huh('ERR_FETCH_FAILED', { userName: '홍길동' });

      // 또는 API 에러 코드로 트리거 (errorMap 경유)
      huh(e.code);
    }
  };

  return <button onClick={fetchData}>데이터 조회</button>;
}
```

## 주요 기능

### 템플릿 변수

시트에서 `{{variable}}` 문법을 사용하세요. 런타임에 변수가 치환됩니다:

```
시트:   "{{userName}}님, {{count}}건의 오류가 발생했습니다."
코드:   huh('ERR_BATCH', { userName: '홍길동', count: '3' })
결과:   "홍길동님, 3건의 오류가 발생했습니다."
```

### 3가지 에러 타입

| 타입    | 용도                      | 예시                      |
| ------- | ------------------------- | ------------------------- |
| `toast` | 짧고 간단한 알림          | 네트워크 오류, 저장 실패  |
| `modal` | 사용자 확인이 필요한 경우 | 인증 만료, 권한 부족      |
| `page`  | 전체 화면 에러 상태       | 404, 점검 중, 치명적 오류 |

### 자동 액션 처리

시트에서 액션을 정의하면, Huh가 동작을 자동으로 처리합니다:

| 액션 타입  | 동작                              |
| ---------- | --------------------------------- |
| `redirect` | 지정된 URL로 이동                 |
| `retry`    | 에러 초기화 + `onRetry` 콜백 실행 |
| `back`     | `history.back()` 호출             |
| `dismiss`  | 에러 초기화                       |

### 빌드 타임 유효성 검증

```bash
npx huh validate

# ✓ 12개 에러 항목 로드
# ⚠ WARN_TOAST_TITLE: toast 타입에는 title이 불필요합니다
# ✗ ERR_REDIRECT: redirect 액션에는 target URL이 필요합니다
```

CI/CD 파이프라인에 적합합니다. 콘텐츠 오류를 프로덕션에 배포되기 전에 잡아냅니다.

## 패키지

| 패키지                             | 설명                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| [`@sanghyuk-2i/huh-core`](./packages/core)     | 의존성 제로. 타입, 파싱, 템플릿 엔진, 유효성 검증. **CDN 지원.** |
| [`@sanghyuk-2i/huh-react`](./packages/react)   | React 바인딩. `HuhProvider` + `useHuh` 훅.                       |
| [`@sanghyuk-2i/huh-vue`](./packages/vue)       | Vue 3 바인딩. `HuhProvider` + `useHuh` composable.               |
| [`@sanghyuk-2i/huh-svelte`](./packages/svelte) | Svelte 5 바인딩. `HuhProvider` + `useHuh`.                       |
| [`@sanghyuk-2i/huh-cli`](./packages/cli)       | `init` / `pull` / `validate` 명령어.                             |

`@sanghyuk-2i/huh-core`는 **의존성이 전혀 없으며** 모든 JavaScript 런타임에서 동작합니다. vanilla JS에서도 단독으로 사용할 수 있습니다.

## 왜 Huh인가요?

|                    | 기존 방식 (산재)      | Huh 도입 후                  |
| ------------------ | --------------------- | ---------------------------- |
| **에러 문구**      | 컴포넌트에 하드코딩   | 외부 데이터 소스에서 관리    |
| **문구 수정**      | 코드 변경 + 배포 필요 | 시트 수정 → `huh pull`       |
| **수정 가능 인원** | 개발자만              | 시트 접근 권한이 있는 누구나 |
| **일관성**         | 개발자마다 다른 패턴  | 하나의 패턴, 모든 곳에서     |
| **타입 안전성**    | 없음                  | 완전한 TypeScript 지원       |
| **유효성 검증**    | 없음                  | 빌드 타임 + CI 검증          |

## 템플릿

각 데이터 소스에 맞는 템플릿을 복사/다운로드하여 바로 시작할 수 있습니다:

| 데이터 소스   | 템플릿                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Sheets | [템플릿 복사](https://docs.google.com/spreadsheets/d/TEMPLATE_SHEET_ID/copy)                                                                                                     |
| Airtable      | [템플릿 복제](https://airtable.com/TEMPLATE_BASE_ID)                                                                                                                             |
| Notion        | [템플릿 복제](https://notion.so/TEMPLATE_DB_ID)                                                                                                                                  |
| XLSX          | [다운로드](https://github.com/your-org/huh/releases/latest/download/huh-template.xlsx)                                                                                           |
| CSV           | [한국어](https://github.com/your-org/huh/releases/latest/download/huh-template-ko.csv) · [English](https://github.com/your-org/huh/releases/latest/download/huh-template-en.csv) |

## 문서

- [시작하기](./docs/ko/getting-started.mdx) - 전체 설정 가이드
- [Google Sheet 설정](./docs/ko/guides/google-sheets.mdx) · [Airtable](./docs/ko/guides/airtable.mdx) · [Notion](./docs/ko/guides/notion.mdx) · [CSV](./docs/ko/guides/csv.mdx) · [XLSX](./docs/ko/guides/xlsx.mdx)
- [@sanghyuk-2i/huh-core API](./docs/ko/api/core.mdx) - `parseSheetData`, `resolveError`, `validateConfig`
- [@sanghyuk-2i/huh-react API](./docs/ko/api/react.mdx) - `HuhProvider`, `useHuh`, 렌더러 타입
- [@sanghyuk-2i/huh-vue API](./docs/ko/api/vue.mdx) - Vue 3 바인딩
- [@sanghyuk-2i/huh-svelte API](./docs/ko/api/svelte.mdx) - Svelte 5 바인딩
- [@sanghyuk-2i/huh-cli API](./docs/ko/api/cli.mdx) - CLI 명령어 및 설정 옵션
- [아키텍처](./docs/ko/architecture.mdx) - 설계 결정 및 데이터 흐름

## CI/CD 연동

```yaml
# .github/workflows/sync-errors.yml
- name: 에러 콘텐츠 동기화
  run: npx huh pull
  env:
    # 사용하는 데이터 소스에 맞는 키를 설정하세요
    GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }} # Google Sheets
    # AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}   # Airtable
    # NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}       # Notion

- name: 유효성 검증
  run: npx huh validate

- name: 변경 사항 커밋
  run: |
    git add src/huh.json
    git commit -m "chore: sync error content" || true
```

## 기여하기

```bash
git clone https://github.com/your-org/huh.git
cd huh
pnpm install
pnpm build
pnpm test
```

이 모노레포는 [Turborepo](https://turbo.build/)와 [pnpm workspaces](https://pnpm.io/workspaces)를 사용합니다.

## 라이선스

[MIT](LICENSE)
