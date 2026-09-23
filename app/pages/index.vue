<script setup lang="ts">
const { locale } = useLandingLocale()
const { data } = await useLandingContent()
const settings = computed(() => data.value!.settings)
const projects = computed(() => data.value!.projects)

const requestUrl = useRequestURL()
const canonicalUrl = computed(() => requestUrl.protocol + '//' + requestUrl.host + '/')
const localizedTitle = computed(() => locale.value === 'ar' ? settings.value.coming_soon_text_ar : settings.value.coming_soon_text_en)
const localizedDescription = computed(() => locale.value === 'ar' ? settings.value.helper_text_ar : settings.value.helper_text_en)

useSeoMeta({
  title: () => 'Building Suit — ' + localizedTitle.value,
  description: () => localizedDescription.value || 'Building Suit',
  ogTitle: () => 'Building Suit — ' + localizedTitle.value,
  ogDescription: () => localizedDescription.value || 'Building Suit',
  ogType: 'website',
  ogUrl: () => canonicalUrl.value,
  ogImage: () => settings.value.cover_image_url || settings.value.logo_url || requestUrl.protocol + '//' + requestUrl.host + '/brand/building-suit-logo-light-lg.png',
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
  <LandingDynamicLanding :settings="settings" :projects="projects" :locale="locale" />
</template>
