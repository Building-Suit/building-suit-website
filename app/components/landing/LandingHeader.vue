<script setup lang="ts">
import { headerSurfaceTransition } from "~/utils/buildingSuitMotion";

const { resolvedTheme } = useAppearance();

const scrolled = ref(false);
const SCROLL_THRESHOLD = 64;

function onScroll() {
  scrolled.value = window.scrollY > SCROLL_THRESHOLD;
}

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});

// Hero surface is always Building Navy in both modes, so the transparent header always
// uses the light/silver logo. Once scrolled to a solid surface, the logo follows the
// active theme's surface (light surface -> dark logo, dark surface -> light logo).
const logoVariant = computed<"light" | "dark">(() => {
  if (!scrolled.value) return "light";
  return resolvedTheme.value === "dark" ? "light" : "dark";
});
</script>

<template>
  <header
    class="bs-header"
    :class="{ 'bs-header--scrolled': scrolled }"
    :style="{ transitionDuration: `${headerSurfaceTransition.duration}s` }"
  >
    <div class="bs-container bs-header__inner">
      <a href="#main-content" class="bs-header__brand" role="img" aria-label="Building Suit">
        <img
          data-bs-logo
          src="/brand/building-suit-logo-dark-sm.png"
          srcset="/brand/building-suit-logo-dark-sm.png 1x, /brand/building-suit-logo-dark-sm@2x.png 2x"
          width="35"
          height="48"
          alt=""
          aria-hidden="true"
          class="bs-header__logo"
          :class="{ 'is-visible': logoVariant === 'dark' }"
        >
        <img
          data-bs-logo
          src="/brand/building-suit-logo-light-sm.png"
          srcset="/brand/building-suit-logo-light-sm.png 1x, /brand/building-suit-logo-light-sm@2x.png 2x"
          width="35"
          height="48"
          alt=""
          aria-hidden="true"
          class="bs-header__logo"
          :class="{ 'is-visible': logoVariant === 'light' }"
        >
      </a>

      <div class="bs-header__controls">
        <ControlsLanguageControl :on-brand-surface="!scrolled" />
        <ControlsAppearanceControl :on-brand-surface="!scrolled" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.bs-header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 50;
  height: 72px;
  display: flex;
  align-items: center;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition-property: background-color, border-color;
  transition-timing-function: var(--bs-easing-standard);
}

.bs-header--scrolled {
  background: var(--bs-surface);
  border-bottom-color: var(--bs-divider);
}

.bs-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.bs-header__brand {
  position: relative;
  display: inline-block;
  height: 40px;
  width: 96px;
}

.bs-header__logo {
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  height: 40px;
  width: auto;
  opacity: 0;
  transition: opacity var(--bs-duration-quick) var(--bs-easing-standard);
}

.bs-header__logo.is-visible {
  opacity: 1;
}

.bs-header__controls {
  display: flex;
  align-items: center;
  gap: var(--bs-spacing-2);
}

@media (prefers-reduced-motion: reduce) {
  .bs-header,
  .bs-header__logo {
    transition: none;
  }
}
</style>
