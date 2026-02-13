import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Huh",
  description: "Error messages belong in a spreadsheet, not in your codebase",

  // Base URL for GitHub Pages - update with your repo name
  base: '/huh/',

  // Clean URLs
  cleanUrls: true,

  // Last updated timestamp
  lastUpdated: true,

  // Head tags
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: 'https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png' }],
    ['meta', { name: 'theme-color', content: '#8B5CF6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'Huh' }],
    ['meta', { name: 'og:image', content: 'https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png' }],
  ],

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // Locales configuration for i18n
  locales: {
    ko: {
      label: '한국어',
      lang: 'ko',
      themeConfig: {
        nav: [
          { text: '홈', link: '/ko/' },
          { text: '문서', link: '/ko/getting-started' },
          { text: 'GitHub', link: 'https://github.com/sanghyuk-2i/huh' }
        ],

        editLink: {
          pattern: 'https://github.com/sanghyuk-2i/huh/edit/main/docs/:path',
          text: '이 페이지 수정 제안하기'
        },

        outline: {
          level: [2, 3],
          label: '목차'
        },

        lastUpdated: {
          text: '마지막 업데이트',
          formatOptions: {
            dateStyle: 'medium',
            timeStyle: 'short'
          }
        },

        docFooter: {
          prev: '이전',
          next: '다음'
        },

        sidebar: [
          {
            text: '시작하기',
            items: [
              { text: '소개', link: '/ko/getting-started' },
              { text: '아키텍처', link: '/ko/architecture' }
            ]
          },
          {
            text: 'API 레퍼런스',
            items: [
              { text: 'Core', link: '/ko/api/core' },
              { text: 'React', link: '/ko/api/react' },
              { text: 'Vue', link: '/ko/api/vue' },
              { text: 'Svelte', link: '/ko/api/svelte' },
              { text: 'CLI', link: '/ko/api/cli' },
              { text: 'Test', link: '/ko/api/test' }
            ]
          },
          {
            text: '데이터 소스 가이드',
            items: [
              { text: 'Google Sheets', link: '/ko/guides/google-sheets' },
              { text: 'Airtable', link: '/ko/guides/airtable' },
              { text: 'Notion', link: '/ko/guides/notion' },
              { text: 'CSV', link: '/ko/guides/csv' },
              { text: 'XLSX', link: '/ko/guides/xlsx' }
            ]
          },
          {
            text: '가이드',
            items: [
              { text: '다국어 지원', link: '/ko/guides/i18n' },
              { text: '플러그인', link: '/ko/guides/plugins' }
            ]
          }
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024-present Lee Sang Hyuk'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Docs', link: '/en/getting-started' },
          { text: 'GitHub', link: 'https://github.com/sanghyuk-2i/huh' }
        ],

        editLink: {
          pattern: 'https://github.com/sanghyuk-2i/huh/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        },

        outline: {
          level: [2, 3],
          label: 'On this page'
        },

        lastUpdated: {
          text: 'Last updated',
          formatOptions: {
            dateStyle: 'medium',
            timeStyle: 'short'
          }
        },

        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },

        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Introduction', link: '/en/getting-started' },
              { text: 'Architecture', link: '/en/architecture' }
            ]
          },
          {
            text: 'API Reference',
            items: [
              { text: 'Core', link: '/en/api/core' },
              { text: 'React', link: '/en/api/react' },
              { text: 'Vue', link: '/en/api/vue' },
              { text: 'Svelte', link: '/en/api/svelte' },
              { text: 'CLI', link: '/en/api/cli' },
              { text: 'Test', link: '/en/api/test' }
            ]
          },
          {
            text: 'Data Source Guides',
            items: [
              { text: 'Google Sheets', link: '/en/guides/google-sheets' },
              { text: 'Airtable', link: '/en/guides/airtable' },
              { text: 'Notion', link: '/en/guides/notion' },
              { text: 'CSV', link: '/en/guides/csv' },
              { text: 'XLSX', link: '/en/guides/xlsx' }
            ]
          },
          {
            text: 'Guides',
            items: [
              { text: 'Internationalization', link: '/en/guides/i18n' },
              { text: 'Plugins', link: '/en/guides/plugins' }
            ]
          }
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024-present Lee Sang Hyuk'
        }
      }
    }
  },

  // Theme configuration
  themeConfig: {
    logo: 'https://em-content.zobj.net/source/apple/391/face-with-open-mouth_1f62e.png',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sanghyuk-2i/huh' }
    ],

    search: {
      provider: 'local'
    }
  }
})
