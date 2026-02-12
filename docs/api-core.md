# @huh/core API

에러 콘텐츠 JSON DSL의 타입 정의, 시트 데이터 파싱, 변수 치환, 유효성 검증을 담당하는 핵심 패키지입니다. 외부 의존성이 없습니다.

## 설치

```bash
pnpm add @huh/core
```

### CDN

```html
<!-- unpkg -->
<script src="https://unpkg.com/@huh/core"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@huh/core"></script>

<!-- 버전 고정 -->
<script src="https://unpkg.com/@huh/core@0.1.0"></script>
```

CDN으로 로드하면 `window.HuhCore` 글로벌 변수로 모든 API에 접근할 수 있습니다:

```js
const { resolveError, parseSheetData, validateConfig, renderTemplate } = HuhCore;
```

---

## 타입

### `ERROR_TYPES` (상수)

기본 제공 에러 타입의 대문자 상수입니다.

```ts
const ERROR_TYPES = {
  TOAST: 'TOAST',
  MODAL: 'MODAL',
  PAGE: 'PAGE',
} as const;
```

### `ACTION_TYPES` (상수)

기본 제공 액션 타입의 대문자 상수입니다.

```ts
const ACTION_TYPES = {
  REDIRECT: 'REDIRECT',
  RETRY: 'RETRY',
  BACK: 'BACK',
  DISMISS: 'DISMISS',
} as const;
```

### `ErrorType`

기본 제공 타입 + 커스텀 타입을 허용하는 확장 가능한 문자열 타입입니다. 값은 대문자로 관리됩니다.

```ts
type BuiltInErrorType = 'TOAST' | 'MODAL' | 'PAGE';
type ErrorType = BuiltInErrorType | (string & {});  // 'BANNER', 'SNACKBAR' 등 자유 확장
```

### `ActionType`

기본 제공 액션 타입 + 커스텀 액션 타입을 허용합니다.

```ts
type BuiltInActionType = 'REDIRECT' | 'RETRY' | 'BACK' | 'DISMISS';
type ActionType = BuiltInActionType | (string & {});  // 'OPEN_CHAT', 'SHARE' 등 자유 확장
```

### `ErrorAction`

```ts
interface ErrorAction {
  label: string;       // 액션 버튼 텍스트
  type: ActionType;    // 액션 종류
  target?: string;     // redirect 시 이동할 URL
}
```

### `ErrorEntry`

하나의 에러 항목을 나타냅니다.

```ts
interface ErrorEntry {
  type: ErrorType;        // 에러 표시 유형
  message: string;        // 에러 메시지 (템플릿 변수 포함 가능)
  title?: string;         // 제목 (modal, page용)
  image?: string;         // 이미지 URL (page용)
  action?: ErrorAction;   // 사용자 액션
}
```

### `ErrorConfig`

전체 에러 설정. `trackId`를 키로 하는 `ErrorEntry` 맵입니다.

```ts
type ErrorConfig = Record<string, ErrorEntry>;
```

```json
{
  "ERR_LOGIN_FAILED": {
    "type": "TOAST",
    "message": "로그인에 실패했습니다"
  },
  "ERR_NOT_FOUND": {
    "type": "PAGE",
    "message": "페이지를 찾을 수 없습니다",
    "title": "404"
  },
  "ERR_MAINTENANCE": {
    "type": "BANNER",
    "message": "서버 점검 중입니다"
  }
}
```

### `ResolvedError`

`resolveError` 함수의 반환 타입. `ErrorEntry`에 `trackId`가 추가된 형태입니다.

```ts
interface ResolvedError extends ErrorEntry {
  trackId: string;
}
```

### `ValidationResult`

```ts
interface ValidationResult {
  valid: boolean;                  // 에러가 없으면 true
  errors: ValidationError[];       // 에러 목록 (type 누락, 잘못된 값 등)
  warnings: ValidationError[];     // 경고 목록 (toast에 title 사용 등)
}

interface ValidationError {
  trackId?: string;
  field?: string;
  message: string;
}
```

---

## 함수

### `parseSheetData(rows: string[][]): ErrorConfig`

데이터 소스의 raw 데이터(헤더 + 데이터 행 배열)를 `ErrorConfig`로 변환합니다. Google Sheets, Airtable, Notion, CSV, XLSX 등 모든 소스에서 동일한 2D 문자열 배열 형식을 사용합니다.

**매개변수**

| 이름 | 타입 | 설명 |
|------|------|------|
| `rows` | `string[][]` | 첫 번째 행이 헤더인 2차원 문자열 배열 |

**예외**

- 행이 2개 미만이면 에러
- `trackId`, `type`, `message` 헤더가 없으면 에러
- `type`이 비어있으면 에러

> `type`과 `actionType` 값은 자동으로 대문자로 변환됩니다. 데이터 소스에서 `toast`, `Toast`, `TOAST` 어느 것을 입력해도 `TOAST`로 처리됩니다.
> 기본 제공 타입 외에도 커스텀 타입(`BANNER`, `SNACKBAR` 등)을 자유롭게 사용할 수 있습니다.

**예시**

```ts
import { parseSheetData } from '@huh/core';

const rows = [
  ['trackId', 'type', 'message', 'title', 'image', 'actionLabel', 'actionType', 'actionTarget'],
  ['ERR_001', 'toast', '오류가 발생했습니다', '', '', '', '', ''],
  ['ERR_002', 'modal', '세션 만료', '알림', '', '확인', 'dismiss', ''],
  ['ERR_003', 'banner', '서버 점검 중', '', '', '문의하기', 'open_chat', ''],
];

const config = parseSheetData(rows);
// {
//   ERR_001: { type: 'TOAST', message: '오류가 발생했습니다' },
//   ERR_002: { type: 'MODAL', message: '세션 만료', title: '알림', action: { label: '확인', type: 'DISMISS' } },
//   ERR_003: { type: 'BANNER', message: '서버 점검 중', action: { label: '문의하기', type: 'OPEN_CHAT' } }
// }
```

---

### `resolveError(config, trackId, variables?): ResolvedError`

`trackId`로 에러를 조회하고, 메시지/제목/액션의 템플릿 변수를 치환합니다.

**매개변수**

| 이름 | 타입 | 설명 |
|------|------|------|
| `config` | `ErrorConfig` | 에러 설정 |
| `trackId` | `string` | 조회할 에러 ID |
| `variables` | `Record<string, string>` | 템플릿 변수 (선택) |

**예외**

- `trackId`가 config에 없으면 `Unknown trackId` 에러

**예시**

```ts
import { resolveError } from '@huh/core';

const config = {
  ERR_SESSION: {
    type: 'MODAL',
    message: '{{userName}}님의 세션이 만료되었습니다',
    title: '{{userName}}님',
    action: { label: '재로그인', type: 'REDIRECT', target: '/login' },
  },
};

const resolved = resolveError(config, 'ERR_SESSION', { userName: '홍길동' });
// resolved.message → "홍길동님의 세션이 만료되었습니다"
// resolved.title   → "홍길동님"
// resolved.trackId → "ERR_SESSION"
```

---

### `renderTemplate(template, variables): string`

문자열 내 `{{변수명}}` 플레이스홀더를 치환합니다. 매칭되지 않는 변수는 그대로 남습니다.

**매개변수**

| 이름 | 타입 | 설명 |
|------|------|------|
| `template` | `string` | 템플릿 문자열 |
| `variables` | `Record<string, string>` | 치환할 변수 맵 |

**예시**

```ts
import { renderTemplate } from '@huh/core';

renderTemplate('{{name}}님, 안녕하세요!', { name: '홍길동' });
// → "홍길동님, 안녕하세요!"

renderTemplate('{{a}} and {{b}}', { a: 'Hello' });
// → "Hello and {{b}}"  (미매칭 변수는 유지)
```

---

### `validateConfig(config): ValidationResult`

`ErrorConfig`의 유효성을 검증합니다.

**검증 규칙 (errors)**

| 조건 | 메시지 |
|------|--------|
| `type`이 비어있음 | Missing required field: type |
| `message`가 비어있음 | Missing required field: message |
| `action.label`이 비어있음 | Action is missing required field: label |
| `REDIRECT` 타입인데 `target`이 없음 | Action type "REDIRECT" requires a target URL |

> 커스텀 타입(`BANNER`, `SNACKBAR` 등)은 에러 없이 통과합니다. 타입 값 자체의 유효성은 검증하지 않으며, 비어있는 경우에만 에러를 발생시킵니다.

**경고 규칙 (warnings)**

기본 제공 타입에 대해서만 경고가 발생합니다. 커스텀 타입에는 경고가 발생하지 않습니다.

| 조건 | 메시지 |
|------|--------|
| config가 비어있음 | Config is empty |
| `TOAST`에 title이 있음 | Toast errors typically do not display a title |
| `TOAST`에 image가 있음 | Toast errors typically do not display an image |
| `PAGE`에 action이 없음 | Page errors should provide an action |

**예시**

```ts
import { validateConfig } from '@huh/core';

const result = validateConfig({
  ERR_001: { type: 'TOAST', message: '' },
  ERR_002: { type: 'MODAL', message: 'OK', action: { label: 'Go', type: 'REDIRECT' } },
  ERR_003: { type: 'BANNER', message: 'Custom type works' },  // 커스텀 타입 — 에러 없이 통과
});

// result.valid → false
// result.errors → [
//   { trackId: 'ERR_001', field: 'message', message: 'Missing required field: message' },
//   { trackId: 'ERR_002', field: 'action.target', message: 'Action type "REDIRECT" requires a target URL' },
// ]
```
