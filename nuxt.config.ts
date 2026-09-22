import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-30',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  ssr: true,

  modules: [
    'motion-v/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    '@primevue/nuxt-module',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  css: [
    '@fontsource-variable/manrope/index.css',
    '@fontsource/ibm-plex-sans-arabic/400.css',
    '@fontsource/ibm-plex-sans-arabic/500.css',
    '@fontsource/ibm-plex-sans-arabic/600.css',
    '@fontsource/ibm-plex-sans-arabic/700.css',
    '~/assets/css/tailwind.css',
    '~/assets/css/building-suit-runtime-tokens.css',
    '~/assets/css/reset.css',
    '~/assets/css/base.css',
    '~/assets/css/landing.css',
    '~/assets/css/admin.css',
  ],

  supabase: {
    cookiePrefix: 'bs-website-auth-token',
    redirect: false,
  },

  primevue: {
    options: { unstyled: true },
    components: {
      include: ['Button', 'InputText', 'Textarea', 'ToggleSwitch', 'ProgressBar'],
    },
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/brand/favicon.png' }],
      meta: [{ name: 'theme-color', content: '#0B0B0D' }],
    },
  },
})
