// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-08-01",
  future: { compatibilityVersion: 4 },
  devtools: { enabled: false },
  modules: ["motion-v/nuxt", "@nuxt/eslint"],
  ssr: true,

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: [
    "@fontsource-variable/manrope/index.css",
    "@fontsource/ibm-plex-sans-arabic/400.css",
    "@fontsource/ibm-plex-sans-arabic/500.css",
    "@fontsource/ibm-plex-sans-arabic/600.css",
    "@fontsource/ibm-plex-sans-arabic/700.css",
    "~/assets/css/building-suit-tokens.css",
    "~/assets/css/reset.css",
    "~/assets/css/base.css",
    "~/assets/css/landing.css",
  ],

  app: {
    head: {
      htmlAttrs: { lang: "en", dir: "ltr" },
      link: [{ rel: "icon", type: "image/png", href: "/brand/favicon.png" }],
      script: [
        {
          key: "bs-theme-init",
          tagPosition: "head",
          // Blocking, synchronous, runs before first paint to avoid a light/dark flash.
          // Kept in lockstep with composables/useAppearance.ts (cookie name + resolution rule).
          innerHTML: `(function(){try{var m=document.cookie.match(/(?:^|; )bs-theme=([^;]*)/);var v=m?decodeURIComponent(m[1]):'system';var resolved=v==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):v;document.documentElement.setAttribute('data-theme',resolved);document.documentElement.style.colorScheme=resolved;}catch(e){}})();`,
        },
      ],
    },
  },
});
