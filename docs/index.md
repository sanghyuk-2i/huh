---
layout: home

hero:
  name: "Huh"
  text: "에러 메시지는 코드가 아니라 스프레드시트에서 관리하세요"
  tagline: Error messages belong in a spreadsheet, not in your codebase. Manage your content in Google Sheets, Airtable, Notion — and ship without code changes.
  image:
    src: https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png
    alt: Huh
  actions:
    - theme: brand
      text: 시작하기 →
      link: /ko/getting-started
    - theme: alt
      text: Get Started →
      link: /en/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/sanghyuk-2i/huh

features:
  - icon: ⚡
    title: Zero Code Changes
    details: 기획자가 시트에서 문구를 수정하면 끝. 코드 변경이나 배포 없이 에러 메시지를 업데이트합니다.
  - icon: 🛡️
    title: Type-Safe
    details: 완전한 TypeScript 지원. 빌드 타임 유효성 검증으로 콘텐츠 오류를 프로덕션 전에 잡아냅니다.
  - icon: 🔌
    title: Any Data Source
    details: Google Sheets, Airtable, Notion, CSV, XLSX. 익숙한 도구에서 에러 콘텐츠를 관리하세요.
  - icon: ⚛️
    title: Framework Agnostic
    details: React, Vue, Svelte 또는 Vanilla JS. 원하는 프레임워크에서 사용하세요.
  - icon: 🚀
    title: Fast & Lightweight
    details: Zero dependencies in core library. 빠른 빌드 타임과 작은 번들 사이즈.
  - icon: 🌍
    title: i18n Ready
    details: 다국어 지원이 내장되어 있어 글로벌 제품을 쉽게 만들 수 있습니다.
---

<InstallSection>

::: code-group

```bash [pnpm]
# Install core + framework binding
pnpm add @sanghyuk-2i/huh-core @sanghyuk-2i/huh-react

# Install CLI for data pulling
pnpm add -D @sanghyuk-2i/huh-cli
```

```bash [npm]
# Install core + framework binding
npm install @sanghyuk-2i/huh-core @sanghyuk-2i/huh-react

# Install CLI for data pulling
npm install -D @sanghyuk-2i/huh-cli
```

```bash [yarn]
# Install core + framework binding
yarn add @sanghyuk-2i/huh-core @sanghyuk-2i/huh-react

# Install CLI for data pulling
yarn add -D @sanghyuk-2i/huh-cli
```

:::

</InstallSection>

<WorkflowSection>

```typescript
// 1. Setup Provider (once)
<HuhProvider config={errorConfig}>
  <App />
</HuhProvider>

// 2. Use anywhere in your app
function LoginPage() {
  const huh = useHuh();

  try {
    await login();
  } catch (error) {
    // Shows error UI automatically from spreadsheet
    huh('ERR_AUTH', { userName: user.name });
  }
}
```

</WorkflowSection>

<PackagesSection />

<CTASection />
