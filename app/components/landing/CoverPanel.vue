<script setup lang="ts">
defineProps<{ src: string }>()
</script>

<template>
  <figure class="bs-cover">
    <div class="bs-cover__halo" aria-hidden="true" />
    <img :src="src" alt="" class="bs-cover__image">
  </figure>
</template>

<style scoped>
.bs-cover { position:relative; margin:0; width:100%; min-width:0; }
.bs-cover__halo { position:absolute; inset:8% 10%; background:rgba(216,155,66,.16); filter:blur(46px); border-radius:50%; }
.bs-cover__image { position:relative; z-index:1; width:100%; aspect-ratio:16/10; max-height:430px; object-fit:cover; border-radius:22px; border:1px solid rgba(255,255,255,.14); background:var(--bs-color-neutral-charcoal); box-shadow:0 28px 80px rgba(0,0,0,.38); }
</style>
