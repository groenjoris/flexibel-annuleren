// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  ssr: true,
  components: [
    {
      path: '~/components',
      pathPrefix: true,
    },
    // R1 homepage copied from code-vialuxury — components auto-imported
    // with the same `FirstRelease` prefix as in the source project.
    {
      path: '~/components-first-release',
      prefix: 'FirstRelease',
      pathPrefix: false,
    },
  ],
  imports: {
    dirs: ['composables-first-release/**', 'stores-first-release/**'],
  },
  modules: ['@pinia/nuxt'],
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    // R1 homepage styling (marketing site). Variables/fonts are additive;
    // base/typography are scoped under .fr-scope to keep the checkout intact.
    '~/assets/css/fr-fonts.css',
    '~/assets/css/fr-variables.css',
    '~/assets/css/fr-base-scoped.css',
    '~/assets/css/variant-2.css',
    '~/assets/css/fr-variant-6.css',
    '~/assets/css/fr-home-variants.css',
    '~/assets/css/home-categories.css',
  ],
  app: {
    head: {
      title: 'ViaLuxury — Afrekenen',
      // data-fr-variant="6" activates the R1 v6 design CSS on the homepage.
      htmlAttrs: { lang: 'nl', 'data-fr-variant': '6' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/logos/logo-vialuxury-horizontal-black.svg' },
      ],
    },
  },
})
