// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false, // SPA mode — ideal para dashboards con auth

  devtools: { enabled: true },

  devServer: {
    port: 3000,
  },

  css: [
    '~/assets/styles/tailwind.css',
    '~/assets/styles/main.scss',
    '~/assets/styles/design-system.scss',
  ],

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins!.push(vuetify({ autoImport: true }) as any)
      })
    },
  ],

  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    cssPath: '~/assets/styles/tailwind.css',
    exposeConfig: false,
    viewer: false,
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: true,   // Todos con prefijo: SharedGlobalSnackbar, NavigationDrawer, AppBar, AuthLoginForm, etc.
      },
    ],
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },

  routeRules: {
    '/cliente/servicios/servicios': { redirect: '/cliente/servicios' },
    '/cliente/servicios/servicios/carrito': { redirect: '/cliente/servicios/carrito' },
    '/cliente/servicios/servicios/mis-pedidos': { redirect: '/cliente/servicios/mis-pedidos' },
  },

  compatibilityDate: '2024-11-01',
})
