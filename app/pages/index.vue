<script setup lang="ts">
const { locale, toggleLocale } = useLandingLocale()
const { data } = await useLandingContent()
const settings = computed(() => data.value!.settings)
const projects = computed(() => data.value!.projects)

const requestUrl = useRequestURL()
const canonicalUrl = computed(() => `${requestUrl.protocol}//${requestUrl.host}/`)
const localizedTitle = computed(() => locale.value === 'ar' ? settings.value.coming_soon_text_ar : settings.value.coming_soon_text_en)
const localizedDescription = computed(() => locale.value === 'ar' ? settings.value.helper_text_ar : settings.value.helper_text_en)

useSeoMeta({
  title: () => `Building Suit — ${localizedTitle.value}`,
  description: () => localizedDescription.value || 'Building Suit',
  ogTitle: () => `Building Suit — ${localizedTitle.value}`,
  ogDescription: () => localizedDescription.value || 'Building Suit',
  ogType: 'website',
  ogUrl: () => canonicalUrl.value,
  ogImage: () => settings.value.cover_image_url || settings.value.logo_url || `${requestUrl.protocol}//${requestUrl.host}/brand/building-suit-logo-light-lg.png`,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Building Suit', url: canonicalUrl.value }),
  }],
})
</script>

<template>
  <main id="main-content" aria-label="Building Suit">
    <LandingDynamicLanding :settings="settings" :projects="projects" :locale="locale" />

    <button
      class="bs-locale-control"
      type="button"
      :aria-label="locale === 'en' ? 'Switch to Arabic' : 'Switch to English'"
      @click="toggleLocale"
    >
      {{ locale === 'en' ? 'AR' : 'EN' }}
    </button>
  </main>
</template>

<style scoped>
.bs-locale-control {
  position: fixed;
  z-index: 20;
  inset-inline-end: 14px;
  top: 50%;
  transform: translateY(-50%);
  min-width: 42px;
  height: 42px;
  padding: 0 9px;
  border: 1px solid var(--bs-color-brand-context-boundary);
  border-radius: 14px;
  background: rgba(14, 17, 20, 0.72);
  backdrop-filter: blur(14px);
  color: var(--bs-color-brand-context-on-surface-muted);
  font: inherit;
  font-size: 0.72rem;
  font-weight: var(--bs-typography-font-weight-extrabold);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition:
    border-color var(--bs-duration-quick) var(--bs-easing-standard),
    color var(--bs-duration-quick) var(--bs-easing-standard),
    background-color var(--bs-duration-quick) var(--bs-easing-standard);
}

.bs-locale-control:hover {
  border-color: var(--bs-color-brand-premium-gold);
  color: var(--bs-color-brand-highlight-gold);
  background: rgba(14, 17, 20, 0.84);
}

.bs-locale-control:focus-visible {
  outline: var(--bs-size-focus-ring) solid var(--bs-color-brand-highlight-gold);
  outline-offset: var(--bs-size-focus-offset);
}

@media (max-width: 640px) {
  .bs-locale-control {
    top: auto;
    bottom: max(14px, env(safe-area-inset-bottom));
    transform: none;
  }
}
</style>
