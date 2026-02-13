// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'

import InstallSection from './components/InstallSection.vue'
import WorkflowSection from './components/WorkflowSection.vue'
import PackagesSection from './components/PackagesSection.vue'
import CTASection from './components/CTASection.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('InstallSection', InstallSection)
    app.component('WorkflowSection', WorkflowSection)
    app.component('PackagesSection', PackagesSection)
    app.component('CTASection', CTASection)
  }
} satisfies Theme
