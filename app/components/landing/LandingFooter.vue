<script setup lang="ts">
const { copy } = useLandingLocale();
const { resolvedTheme } = useAppearance();

const logoVariant = computed(() => (resolvedTheme.value === "dark" ? "light" : "dark"));

const year = new Date().getFullYear();
</script>

<template>
  <footer class="bs-footer">
    <div class="bs-container bs-footer__inner">
      <img
        :src="`/brand/building-suit-logo-${logoVariant}-sm.png`"
        :srcset="`/brand/building-suit-logo-${logoVariant}-sm.png 1x, /brand/building-suit-logo-${logoVariant}-sm@2x.png 2x`"
        width="24"
        height="32"
        alt="Building Suit"
        data-bs-logo
        class="bs-footer__logo"
      >
      <p class="bs-footer__tagline">{{ copy.footerTagline }}</p>
      <p class="bs-footer__meta">© {{ year }} Building Suit</p>
    </div>
  </footer>
</template>

<style scoped>
.bs-footer {
  background: var(--bs-surface-container);
  border-top: 1px solid var(--bs-divider);
  padding-block: var(--bs-spacing-7);
}

.bs-footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--bs-spacing-3);
}

.bs-footer__logo {
  height: 32px;
  width: auto;
}

.bs-footer__tagline {
  color: var(--bs-text);
  font-size: var(--bs-type-body-m-size);
  font-weight: var(--bs-typography-font-weight-medium);
  max-width: 48ch;
}

.bs-footer__meta {
  /* text-subtle measures 4.43:1 on this surface, just under the AA 4.5:1 normal-text
     target (see docs/visual-qa.md); text-muted clears it while staying de-emphasized. */
  color: var(--bs-text-muted);
  font-size: var(--bs-type-caption-size);
}
</style>
