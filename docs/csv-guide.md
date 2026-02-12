# CSV 파일 가이드

로컬 CSV 파일에서 에러 콘텐츠를 가져오는 방법을 설명합니다. 외부 API나 인증 없이 간단하게 사용할 수 있습니다.

## 템플릿으로 빠르게 시작하기

미리 작성된 CSV 템플릿을 다운로드하면 바로 사용할 수 있습니다.

- [한국어 CSV 템플릿 다운로드](https://github.com/your-org/huh/releases/latest/download/huh-template-ko.csv)
- [English CSV 템플릿 다운로드](https://github.com/your-org/huh/releases/latest/download/huh-template-en.csv)

> 다운로드 후 데이터를 수정하고 `huh pull`을 실행하세요.

---

## 1. CSV 파일 작성

첫 번째 행은 반드시 헤더 행이어야 합니다. 아래 컬럼 구조를 따릅니다:

```csv
trackId,type,message,title,image,actionLabel,actionType,actionTarget
ERR_LOGIN_FAILED,TOAST,로그인에 실패했습니다,,,,,
ERR_SESSION_EXPIRED,MODAL,세션이 만료되었습니다,세션 만료,,다시 로그인,REDIRECT,/login
ERR_NOT_FOUND,PAGE,페이지를 찾을 수 없습니다,404,/img/404.png,홈으로,REDIRECT,/
```

> 소문자로 입력해도 CLI가 자동으로 대문자로 변환합니다. 커스텀 타입(`BANNER`, `SNACKBAR` 등)도 자유롭게 사용할 수 있습니다.

### 컬럼 규칙

| 컬럼명 | 필수 | 설명 |
|--------|------|------|
| `trackId` | O | 에러 고유 ID (예: `ERR_LOGIN_FAILED`) |
| `type` | O | `TOAST`, `MODAL`, `PAGE` 또는 커스텀 타입 |
| `message` | O | 에러 메시지. `{{변수}}` 템플릿 변수 지원 |
| `title` | | 에러 제목 (modal, page용) |
| `image` | | 이미지 URL (page용) |
| `actionLabel` | | 액션 버튼 텍스트 |
| `actionType` | | `REDIRECT`, `RETRY`, `BACK`, `DISMISS` 또는 커스텀 액션 |
| `actionTarget` | | REDIRECT 시 이동할 URL |

### CSV 형식 지원

RFC 4180 호환 파서를 사용하므로 다음을 모두 지원합니다:

- 따옴표로 감싼 필드: `"Hello, World"`
- 필드 내 이스케이프된 따옴표: `"say ""hello"""`
- 필드 내 개행 (따옴표로 감싸야 함)
- CRLF (`\r\n`) 및 LF (`\n`) 줄바꿈
- UTF-8 BOM 자동 제거

## 2. 설정

### `.huh.config.json`

```json
{
  "source": {
    "type": "csv",
    "filePath": "./errors.csv"
  },
  "output": "./src/huh.json"
}
```

### `.huh.config.ts`

```ts
import { defineConfig } from '@huh/cli';

export default defineConfig({
  source: {
    type: 'csv',
    filePath: './errors.csv',
  },
  output: './src/huh.json',
});
```

`filePath`는 상대 경로 또는 절대 경로를 사용할 수 있습니다. 상대 경로는 `process.cwd()` 기준으로 해석됩니다.

## 3. 데이터 가져오기

```bash
huh pull
```

정상적으로 실행되면 `output` 경로에 JSON 파일이 생성됩니다.

## 참고

- CSV 파일에는 헤더 행 + 최소 1개의 데이터 행이 있어야 합니다.
- 추가 의존성 없이 내장 파서를 사용합니다.
- Excel에서 CSV로 내보내기한 파일도 바로 사용할 수 있습니다.
