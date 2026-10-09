<script setup lang="ts">
import { salesProgramContent, publishedSalesHtml } from '~/utils/salesProgram'
const { data } = await useLandingContent()
const content = computed(() => salesProgramContent(data.value?.settings.sales_program))
const html = computed(() => publishedSalesHtml(content.value))
const url = useRequestURL()
useSeoMeta({
  title: () => content.value.title,
  description: () => content.value.description,
  ogTitle: () => content.value.title,
  ogDescription: () => content.value.description,
  ogType: 'website',
  ogImage: `${url.origin}/brand/building-suit-logo-light-lg.png`,
  twitterCard: 'summary_large_image',
})
useHead({ link: [{ rel: 'canonical', href: `${url.origin}/sales-program` }] })
</script>

<template>
  <div class="bs-sales-page" dir="rtl">
    <header class="bs-sales-header">
      <NuxtLink to="/" :aria-label="content.homeLabel"><img src="/brand/building-suit-logo-light-md.png" :alt="content.logoAlt" width="44" height="60"></NuxtLink>
      <NuxtLink to="/">{{ content.homeLabel }}</NuxtLink>
    </header>
    <!-- All visitor copy and CTA labels are one editable rich-text document. -->
    <!-- eslint-disable-next-line vue/no-v-html -- html is allowlist-sanitized for SSR and client. -->
    <main id="main-content" class="bs-sales-content" v-html="html" />
  </div>
</template>

<style scoped>
.bs-sales-page { min-height: 100vh; background: var(--bs-background); color: var(--bs-text); }
.bs-sales-header { max-width: 1120px; margin: auto; padding: 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; border-bottom: 1px solid var(--bs-border); }
.bs-sales-header img { width: auto; height: 60px; object-fit: contain; }
.bs-sales-header a { color: var(--bs-text-muted); font-size: .9rem; }
.bs-sales-content { max-width: 900px; margin: auto; padding: 64px 28px 100px; font-family: var(--bs-typography-font-family-arabic); font-size: 1.12rem; line-height: 1.95; overflow-wrap: anywhere; }
.bs-sales-content :deep(h1) { font-size: clamp(2rem, 4.7vw, 3.8rem); line-height: 1.35; margin: 20px 0 28px; max-width: 850px; }
.bs-sales-content :deep(h1 strong) { font-weight: inherit; }
.bs-sales-content :deep(h2) { border-top: 1px solid var(--bs-border); padding-top: 48px; margin: 64px 0 24px; font-size: clamp(1.5rem, 2.7vw, 2.2rem); line-height: 1.5; scroll-margin-top: 24px; }
.bs-sales-content :deep(h2#commissions) { color: var(--bs-color-brand-premium-gold); }
.bs-sales-content :deep(h3) { font-size: 1.15rem; margin: 28px 0 8px; }
.bs-sales-content :deep(p) { margin: 0 0 24px; }
.bs-sales-content :deep(ul), .bs-sales-content :deep(ol) { margin: 24px 0; padding-inline-start: 28px; }
.bs-sales-content :deep(ul) { list-style: disc; }
.bs-sales-content :deep(ol) { list-style: decimal; }
.bs-sales-content :deep(li) { padding-inline-start: 8px; margin-bottom: 16px; }
.bs-sales-content :deep(li::marker) { color: var(--bs-color-brand-premium-gold); font-weight: 600; }
.bs-sales-content :deep(a) { color: var(--bs-color-brand-premium-gold); text-decoration: underline; text-underline-offset: 5px; }
.bs-sales-content :deep(a.bs-sales-cta) { display: inline-block; padding: 13px 24px; color: var(--bs-color-brand-building-navy); background: var(--bs-color-brand-premium-gold); border-radius: var(--bs-radius-button); text-decoration: none; font-weight: 600; }
.bs-sales-content :deep(hr) { border: 0; border-top: 1px solid var(--bs-border); margin: 60px 0 30px; }
.bs-sales-content :deep(table) { display: block; overflow-x: auto; max-width: 100%; }
.bs-sales-content :deep(th), .bs-sales-content :deep(td) { padding: 12px; border: 1px solid var(--bs-border); }
@media (max-width: 640px) { .bs-sales-content { padding: 36px 20px 64px; font-size: 1rem; } .bs-sales-header { padding: 20px; } }
</style>
