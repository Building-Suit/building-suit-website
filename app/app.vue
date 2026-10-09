<script setup lang="ts">
import type { SiteSettings } from '~/types/content'
import { salesProgramContent } from '~/utils/salesProgram'
const route = useRoute()
const { locale, dir } = useLandingLocale()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const isSales = computed(() => route.path === '/sales-program')
const { data: landingData } = useNuxtData<{ settings: SiteSettings }>('building-suit-landing-content')
const skipLabel = computed(() => isSales.value ? salesProgramContent(landingData.value?.settings.sales_program).skipLabel : locale.value === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content')

useHead(() => ({
  htmlAttrs: {
    lang: isAdmin.value ? 'en' : isSales.value ? 'ar' : locale.value,
    dir: isAdmin.value ? 'ltr' : isSales.value ? 'rtl' : dir.value,
    'data-theme': 'dark',
  },
}))
</script>

<template>
  <a v-if="!isAdmin" class="bs-skip-link" href="#main-content">{{ skipLabel }}</a>
  <MotionConfig reduced-motion="user">
    <NuxtPage />
  </MotionConfig>
</template>
