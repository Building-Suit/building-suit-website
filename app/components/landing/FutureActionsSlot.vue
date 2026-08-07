<script setup lang="ts">
// Reserved layout region for future actions (QR code, store badges, a website/contact
// link). Intentionally empty today — see docs/visual-qa.md "Future readiness". Sized to
// comfortably hold a 160-200px QR code and/or two compact action buttons without any
// composition change later. Do not add placeholder text, borders, or "coming later"
// copy here — the emptiness is deliberate negative space, not an unfinished section.
</script>

<template>
  <div class="bs-future-slot" data-testid="future-actions-slot" />
</template>

<style scoped>
.bs-future-slot {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 320px;
  min-height: clamp(16px, 4dvh, 56px);
}

@media (min-width: 768px) {
  .bs-future-slot {
    min-height: clamp(24px, 6dvh, 72px);
  }
}
</style>
