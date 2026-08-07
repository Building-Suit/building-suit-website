<script setup lang="ts">
const { dir, locale, copy } = useLandingLocale();
const { theme, resolvedTheme } = useAppearance();

useHead({
  htmlAttrs: {
    lang: locale,
    dir,
    // Explicit light/dark choices are known at SSR time and can render correctly on
    // first paint; "system" is resolved client-side by the blocking script in
    // nuxt.config.ts (see composables/useAppearance.ts for the shared contract). Kept
    // for future pages — the Coming Soon experience itself always renders the fixed dark
    // architectural treatment regardless of this value (see ComingSoonExperience.vue).
    "data-theme": computed(() => (theme.value === "system" ? undefined : resolvedTheme.value)),
  },
  // #0E1114 mirrors --bs-color-role-dark-background (Neutral 950) — the browser chrome
  // theme-color meta tag can't consume a CSS custom property, so this one value is a
  // deliberate, unavoidable exception to "no raw hex in components."
  meta: [{ name: "theme-color", content: "#0E1114" }],
});
</script>

<template>
  <a class="bs-skip-link" href="#main-content">{{ copy.skipToContent }}</a>
  <MotionConfig reduced-motion="user">
    <NuxtPage />
  </MotionConfig>
</template>
