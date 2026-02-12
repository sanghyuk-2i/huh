# CDN Example

번들러 없이 `<script>` 태그만으로 `@huh/core`를 사용하는 예제입니다.

## 로컬에서 실행

1. 루트에서 core 패키지를 빌드합니다:

```bash
pnpm build --filter @huh/core
```

2. `index.html`을 브라우저에서 엽니다:

```bash
open examples/cdn/index.html
```

> `index.html`이 `../../packages/core/dist/index.global.js`를 직접 참조하므로 별도의 서버가 필요 없습니다.

## CDN으로 사용 (npm 발행 후)

`index.html`의 스크립트 태그를 CDN URL로 변경하면 됩니다:

```html
<!-- unpkg -->
<script src="https://unpkg.com/@huh/core"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@huh/core"></script>

<!-- 버전 고정 -->
<script src="https://unpkg.com/@huh/core@0.1.0"></script>
```

로드 후 `window.HuhCore`로 모든 API에 접근할 수 있습니다:

```js
const { resolveError, parseSheetData, validateConfig } = HuhCore;
```
