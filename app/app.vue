<script setup lang="ts">
const route = useRoute()
const { locale, dir } = useLandingLocale()
const { resolvedTheme } = useAppearance({ syncDocument: false })
const isAdmin = computed(() => route.path.startsWith('/admin'))
const skipLabel = computed(() => locale.value === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content')

useHead(() => ({
  htmlAttrs: {
    lang: isAdmin.value ? 'en' : locale.value,
    dir: isAdmin.value ? 'ltr' : dir.value,
    'data-theme': isAdmin.value ? 'dark' : resolvedTheme.value,
  },
}))
</script>

<template>
  <a v-if="!isAdmin" class="bs-skip-link" href="#main-content">{{ skipLabel }}</a>
  <MotionConfig reduced-motion="user">
    <NuxtPage />
  </MotionConfig>
</template>
