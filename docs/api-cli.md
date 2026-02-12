# @huh/cli API

Google Sheets, Airtable, Notion, CSV, XLSX 등 다양한 데이터 소스에서 에러 콘텐츠를 가져와 JSON 파일로 변환하는 CLI 도구입니다.

## 설치

```bash
pnpm add -D @huh/cli
```

설치 후 `huh` 명령어를 사용할 수 있습니다.

---

## 명령어

### `huh init`

현재 디렉토리에 `.huh.config.ts` 설정 파일 템플릿을 생성합니다.

```bash
npx huh init
```

생성되는 파일에는 Google Sheets, Airtable, Notion, CSV, XLSX 5가지 데이터 소스의 설정 예시가 포함되어 있습니다. 사용할 소스의 주석을 해제하세요.

이미 설정 파일이 있으면 덮어쓰지 않고 경고를 출력합니다.

---

### `huh pull`

설정된 데이터 소스에서 데이터를 가져와 JSON 파일을 생성합니다.

```bash
npx huh pull
```

**실행 흐름:**

1. 설정 파일 읽기 (`.huh.config.json`)
2. Adapter 패턴으로 설정된 데이터 소스에서 데이터 fetch
3. `parseSheetData`로 JSON DSL 변환
4. `validateConfig`로 검증
   - 경고만 있으면 출력 후 계속 진행
   - 에러가 있으면 에러 출력 후 종료 (exit code 1)
5. 지정된 output 경로에 JSON 파일 생성

---

## 설정 파일

현재 v0.1에서는 `.huh.config.json` 형식을 지원합니다.

### Google Sheets

```json
{
  "source": {
    "type": "google-sheets",
    "sheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    "range": "Sheet1"
  },
  "output": "./src/huh.json"
}
```

**인증:**

| 방법 | 설정 |
|------|------|
| API Key (환경변수) | `GOOGLE_API_KEY` 환경변수 설정 |
| API Key (설정파일) | `source.apiKey`에 직접 지정 |
| Service Account | `source.credentials`에 JSON 키 파일 경로 지정 |

```bash
GOOGLE_API_KEY=AIza... npx huh pull
```

자세한 내용: [Google Sheet 설정 가이드](./google-sheet-guide.md)

### Airtable

```json
{
  "source": {
    "type": "airtable",
    "baseId": "appXXXXXXXXXXXXXX",
    "tableId": "tblYYYYYYYYYYYYYY"
  },
  "output": "./src/huh.json"
}
```

**인증:** `AIRTABLE_TOKEN` 환경변수 또는 `source.token`에 직접 지정

자세한 내용: [Airtable 연동 가이드](./airtable-guide.md)

### Notion

```json
{
  "source": {
    "type": "notion",
    "databaseId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "output": "./src/huh.json"
}
```

**인증:** `NOTION_TOKEN` 환경변수 또는 `source.token`에 직접 지정

자세한 내용: [Notion 연동 가이드](./notion-guide.md)

### CSV (로컬 파일)

```json
{
  "source": {
    "type": "csv",
    "filePath": "./errors.csv"
  },
  "output": "./src/huh.json"
}
```

인증 불필요. RFC 4180 호환 CSV 파서를 사용합니다.

자세한 내용: [CSV 파일 가이드](./csv-guide.md)

### XLSX (로컬 파일)

```json
{
  "source": {
    "type": "xlsx",
    "filePath": "./errors.xlsx",
    "sheet": "Sheet1"
  },
  "output": "./src/huh.json"
}
```

인증 불필요. `sheet`를 지정하지 않으면 첫 번째 시트를 사용합니다.

자세한 내용: [XLSX 파일 가이드](./xlsx-guide.md)

---

### `huh validate [file]`

생성된 JSON 파일의 유효성을 검증합니다.

```bash
# 기본 경로 (src/huh.json) 검증
npx huh validate

# 특정 파일 검증
npx huh validate ./path/to/errors.json
```

**출력 예시 (성공):**

```
Validating ./src/huh.json...
Found 5 error entries.

Validation passed!
```

**출력 예시 (경고 + 에러):**

```
Validating ./src/huh.json...
Found 3 error entries.

2 warning(s):
  - [ERR_TOAST] title: Toast errors typically do not display a title
  - [ERR_PAGE] action: Page errors should provide an action for user navigation

1 error(s):
  - [ERR_REDIRECT] action.target: Action type "REDIRECT" requires a target URL

Validation failed.
```

에러가 1개라도 있으면 exit code 1로 종료합니다. 경고만 있으면 통과입니다.

---

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: Huh Error Content Sync
on:
  schedule:
    - cron: '0 9 * * 1-5'  # 평일 오전 9시
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install

      - name: Pull error content
        run: npx huh pull
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
          # Airtable 사용 시: AIRTABLE_TOKEN: ${{ secrets.AIRTABLE_TOKEN }}
          # Notion 사용 시: NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}

      - name: Validate
        run: npx huh validate

      - name: Commit changes
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add src/huh.json
          git diff --staged --quiet || git commit -m "chore: sync error content"
          git push
```

### pre-commit 훅

```bash
# .husky/pre-commit
npx huh validate
```

---

## defineConfig

타입 안전한 설정을 위한 헬퍼 함수입니다.

```ts
import { defineConfig } from '@huh/cli';
import type { HuhCliConfig } from '@huh/cli';
```

```ts
interface HuhCliConfig {
  source: HuhSource;
  output: string;  // JSON 파일 출력 경로
}

// Google Sheets
type GoogleSheetsSource = {
  type: 'google-sheets';
  sheetId: string;
  range?: string;       // 기본값: 'Sheet1'
  apiKey?: string;
  credentials?: string; // 서비스 계정 JSON 키 파일 경로
};

// Airtable
type AirtableSource = {
  type: 'airtable';
  baseId: string;
  tableId: string;
  token?: string;
};

// Notion
type NotionSource = {
  type: 'notion';
  databaseId: string;
  token?: string;
};

// CSV (로컬 파일)
type CsvSource = {
  type: 'csv';
  filePath: string;
};

// XLSX (로컬 파일)
type XlsxSource = {
  type: 'xlsx';
  filePath: string;
  sheet?: string;  // 미지정 시 첫 번째 시트
};

type HuhSource =
  | GoogleSheetsSource
  | AirtableSource
  | NotionSource
  | CsvSource
  | XlsxSource;
```
