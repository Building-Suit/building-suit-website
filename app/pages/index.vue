<script setup lang="ts">
const { copy, locale } = useLandingLocale();

const requestUrl = useRequestURL();
const canonicalUrl = computed(() => `${requestUrl.protocol}//${requestUrl.host}/`);
const ogImage = computed(() => `${requestUrl.protocol}//${requestUrl.host}/og/coming-soon-${locale.value}.png`);

useSeoMeta({
  title: () => copy.value.metaTitle,
  description: () => copy.value.metaDescription,
  ogTitle: () => copy.value.metaTitle,
  ogDescription: () => copy.value.metaDescription,
  ogType: "website",
  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImage.value,
  ogLocale: () => (locale.value === "ar" ? "ar_EG" : "en_US"),
  twitterCard: "summary_large_image",
  twitterTitle: () => copy.value.metaTitle,
  twitterDescription: () => copy.value.metaDescription,
  twitterImage: () => ogImage.value,
});

// Only the factual fields we actually know — no address, phone, founding date, social
// accounts, ratings, pricing, or launch-date schema (see task scope restrictions).
const structuredData = computed(() =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Building Suit",
    url: canonicalUrl.value,
  })
);

useHead({
  link: [{ rel: "canonical", href: () => canonicalUrl.value }],
  script: [{ type: "application/ld+json", innerHTML: () => structuredData.value }],
});
</script>

<template>
  <main id="main-content" :aria-label="copy.mainLabel">
    <LandingComingSoonExperience />
  </main>
</template>
