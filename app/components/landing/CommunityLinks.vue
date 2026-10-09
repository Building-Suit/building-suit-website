<script setup lang="ts">
import type { SiteSettings } from '~/types/content'
import { salesProgramContent, socialLinks, socialPlatforms } from '~/utils/salesProgram'
import { icons } from '~/utils/icons'
const props = defineProps<{ settings: SiteSettings }>()
const sales = computed(() => salesProgramContent(props.settings.sales_program))
const links = computed(() => socialLinks(props.settings.social_links))
const visible = computed(() => socialPlatforms.filter(platform => links.value[platform]))
</script>

<template>
  <div class="bs-community-links" :class="{ 'bs-community-links--socials': visible.length }">
    <NuxtLink class="bs-join-link" to="/sales-program">{{ sales.joinLabel }}</NuxtLink>
    <nav v-if="visible.length" class="bs-social-links" aria-label="Social media">
      <a v-for="platform in visible" :key="platform" :href="links[platform]" :aria-label="platform" :title="platform" target="_blank" rel="noopener noreferrer">
        <HugeiconsIcon :icon="icons[platform]" :size="21" aria-hidden="true" />
      </a>
    </nav>
  </div>
</template>

<style scoped>
.bs-community-links { position: relative; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 20px; flex-shrink: 0; }
.bs-community-links--socials { margin-top: 20px; }
.bs-join-link { position: fixed; top: max(20px, env(safe-area-inset-top)); inset-inline-end: 24px; max-width: calc(50vw - 54px); text-align: center; overflow-wrap: anywhere; color: var(--bs-color-brand-premium-gold); border: 1px solid var(--bs-color-brand-premium-gold); padding: 8px 20px; border-radius: var(--bs-radius-button); font-size: .85rem; font-weight: 600; }
.bs-social-links { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.bs-social-links a { display: grid; place-items: center; width: 44px; height: 44px; color: var(--bs-color-brand-context-on-surface-muted); }
.bs-social-links a:hover { color: var(--bs-color-brand-premium-gold); }
@media (max-width: 430px) { .bs-community-links { gap: 6px; } .bs-community-links--socials { margin-top: 12px; } }
</style>
