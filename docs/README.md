# Huh Documentation

This directory contains the VitePress documentation for the Huh project.

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start dev server
pnpm docs:dev

# Build for production
pnpm docs:build

# Preview production build
pnpm docs:preview
```

## Structure

```
docs/
├── .vitepress/          # VitePress configuration
│   ├── config.mts       # Site configuration
│   └── theme/           # Custom theme
├── index.md             # Korean homepage
├── en/                  # English documentation
│   ├── index.md         # English homepage
│   ├── getting-started.md
│   ├── architecture.md
│   ├── api/             # API reference
│   └── guides/          # User guides
└── ko/                  # Korean documentation
    ├── getting-started.md
    ├── architecture.md
    ├── api/             # API 레퍼런스
    └── guides/          # 사용 가이드
```

## Deployment

This documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

The deployment workflow is defined in `.github/workflows/deploy-docs.yml`.

## Configuration

- **Base URL**: `/huh/` (configured for GitHub Pages at `sanghyuk-2i.github.io/huh`)
- **Theme**: Custom purple theme based on VitePress default
- **i18n**: Korean (root) and English locales
- **Features**:
  - Local search
  - Dark mode
  - Edit links to GitHub
  - Automatic last updated timestamps
  - Responsive sidebar navigation

## Writing Documentation

VitePress uses Markdown with some extensions:

### Code Groups

\`\`\`md
::: code-group

\`\`\`bash [pnpm]
pnpm install package
\`\`\`

\`\`\`bash [npm]
npm install package
\`\`\`

:::
\`\`\`

### Custom Containers

\`\`\`md
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a danger warning
:::
\`\`\`

For more information, see the [VitePress documentation](https://vitepress.dev/).
