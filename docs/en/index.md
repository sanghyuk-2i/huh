---
layout: home

hero:
  name: "Huh"
  text: "Manage error messages in spreadsheets, not code"
  tagline: Error messages belong in a spreadsheet, not in your codebase. Manage your content in Google Sheets, Airtable, Notion — and ship without code changes.
  image:
    src: https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png
    alt: Huh
  actions:
    - theme: brand
      text: Get Started →
      link: /en/getting-started
    - theme: alt
      text: 한국어로 보기 →
      link: /ko/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/sanghyuk-2i/huh

features:
  - icon: ⚡
    title: Zero Code Changes
    details: Update error messages in sheets — no code, no deploy. Product managers can edit content directly without developer intervention.
  - icon: 🛡️
    title: Type-Safe
    details: Full TypeScript support with build-time validation. Catch content errors before they reach production.
  - icon: 🔌
    title: Any Data Source
    details: Works with Google Sheets, Airtable, Notion, CSV, XLSX. Use the tools your team already knows.
  - icon: ⚛️
    title: Framework Agnostic
    details: React, Vue, Svelte, or Vanilla JS. Use it with your favorite framework.
  - icon: 🚀
    title: Fast & Lightweight
    details: Zero dependencies in core library. Fast build times and small bundle sizes.
  - icon: 🌍
    title: i18n Ready
    details: Built-in internationalization support for building global products easily.
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
