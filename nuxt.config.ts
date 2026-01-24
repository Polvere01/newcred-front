export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  css: [
    '~/assets/css/theme.css', // <- suas vars aqui
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },

  compatibilityDate: '2025-12-29',
})
