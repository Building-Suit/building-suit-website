<script setup lang="ts">
import type { SiteSettings } from '~/types/content'
const props = defineProps<{ settings: SiteSettings }>()
const overlayStyle = computed(() => ({
  backgroundColor: props.settings.background_overlay_color || '#0B0B0D',
  opacity: props.settings.background_overlay_opacity ?? 0.58,
}))
</script>

<template>
  <div class="bs-background" aria-hidden="true">
    <LandingArchitecturalAtmosphere v-if="!settings.background_image_url" />
    <img v-else class="bs-background__image" :src="settings.background_image_url" alt="">
    <div
      v-if="settings.background_image_url && settings.background_overlay_enabled"
      class="bs-background__overlay"
      :style="overlayStyle"
    />
  </div>
</template>

<style scoped>
.bs-background { position:absolute; inset:0; overflow:hidden; }
.bs-background__image { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.bs-background__overlay { position:absolute; inset:0; pointer-events:none; }
</style>
