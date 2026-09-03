<script setup lang="ts">
import { platforms } from "~/content/platforms";
import { hoverScale, hoverTransition, platformReveal, pressScale } from "~/utils/buildingSuitMotion";

const { copy, locale } = useLandingLocale();
const reducedMotion = useSafeReducedMotion();

const entries = computed(() =>
  platforms.map((platform) => ({
    id: platform.id,
    name: platform.name,
    url: platform.url,
    tagline: platform.tagline[locale.value],
  }))
);

// Heading, supporting line, and every card share one delay: the rail is the fourth and
// final beat of the entrance, and Motion Spec §3.4's accumulated-stagger cap has already
// been reached by this point in the sequence (see railFirstOrder).
const header = computed(() => platformReveal(0, reducedMotion.value));
const item = (index: number) => platformReveal(index, reducedMotion.value);

// The hover/press contract lives in buildingSuitMotion.ts, but the interaction itself is
// a CSS transition (a persistent hover state on a link doesn't need a JS animation loop).
// Binding the values through custom properties keeps the contract as the single source of
// truth instead of re-typing 1.015 into a stylesheet where it can silently drift.
const interactionVars = {
  "--bs-hover-scale": String(hoverScale),
  "--bs-press-scale": String(pressScale),
  "--bs-hover-duration": `${hoverTransition.duration}s`,
} as const;
</script>

<template>
  <section
    v-if="entries.length"
    class="bs-rail"
    aria-labelledby="bs-rail-title"
    data-testid="platforms-rail"
  >
    <Motion id="bs-rail-title" as="h2" class="bs-rail__title" v-bind="header">
      {{ copy.platformsTitle }}
    </Motion>

    <Motion as="p" class="bs-rail__subtitle" v-bind="header">
      {{ copy.platformsSubtitle }}
    </Motion>

    <ul class="bs-rail__list" :style="interactionVars">
      <Motion
        v-for="(entry, index) in entries"
        :key="entry.id"
        as="li"
        class="bs-rail__item"
        v-bind="item(index)"
      >
        <a class="bs-platform" :href="entry.url" target="_blank" rel="noopener noreferrer">
          <span class="bs-platform__body">
            <span class="bs-platform__name">{{ entry.name }}</span>
            <span class="bs-platform__tagline">{{ entry.tagline }}</span>
          </span>

          <svg
            class="bs-platform__arrow"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 16 16 8" />
            <path d="M9.5 8H16v6.5" />
          </svg>

          <span class="bs-visually-hidden">({{ copy.newTabHint }})</span>
        </a>
      </Motion>
    </ul>
  </section>
</template>

<style scoped>
.bs-rail {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
  gap: clamp(0.25rem, 0.8dvh, 0.6rem);
}

.bs-rail__title {
  color: var(--bs-color-brand-context-on-surface);
  font-size: clamp(1rem, 0.4vw + 1.3dvh, 1.4rem);
  line-height: calc(1.25 * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-bold);
}

.bs-rail__subtitle {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.8rem, 0.3vw + 1dvh, 1rem);
  line-height: calc(1.35 * var(--bs-lh-scale));
}

.bs-rail__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(0.5rem, 1.4dvh, 1rem);
  width: 100%;
  max-width: 880px;
  margin: 0;
  margin-block-start: clamp(0.4rem, 1.4dvh, 1.1rem);
  padding: 0;
  list-style: none;
}

.bs-rail__item {
  flex: 1 1 260px;
  min-width: 0;
  max-width: 420px;
}

/* Sharp-cornered card geometry deliberately echoes the structural planes in
   ArchitecturalAtmosphere.vue rather than the product UI's card radius — this page is the
   brand register, not the app register. */
.bs-platform {
  display: flex;
  align-items: center;
  gap: var(--bs-spacing-3);
  width: 100%;
  padding: clamp(0.7rem, 1.6dvh, 1.05rem) clamp(0.85rem, 2vw, 1.25rem);
  border: 1px solid var(--bs-color-brand-context-boundary);
  border-radius: var(--bs-radius-button);
  background: var(--bs-color-brand-context-overlay);
  color: var(--bs-color-brand-context-on-surface);
  text-decoration: none;
  text-align: start;
  transition:
    background-color var(--bs-hover-duration) var(--bs-easing-standard),
    border-color var(--bs-hover-duration) var(--bs-easing-standard),
    transform var(--bs-hover-duration) var(--bs-easing-standard);
}

.bs-platform__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.bs-platform__name {
  font-size: clamp(0.9rem, 0.3vw + 1.1dvh, 1.1rem);
  font-weight: var(--bs-typography-font-weight-semibold);
  line-height: calc(1.25 * var(--bs-lh-scale));
}

.bs-platform__tagline {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.75rem, 0.25vw + 0.9dvh, 0.9rem);
  line-height: calc(1.3 * var(--bs-lh-scale));
}

.bs-platform__arrow {
  flex: 0 0 auto;
  color: var(--bs-color-brand-premium-gold);
  transition: color var(--bs-hover-duration) var(--bs-easing-standard);
}

/* The arrow is a reading-direction affordance ("away, forward"), not architectural
   geometry, so unlike the background planes it does mirror under RTL. */
html[lang="ar"] .bs-platform__arrow {
  transform: scaleX(-1);
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .bs-platform:hover {
    transform: scale(var(--bs-hover-scale));
  }

  .bs-platform:active {
    transform: scale(var(--bs-press-scale));
  }
}

.bs-platform:hover {
  background: var(--bs-color-brand-context-overlay-hover);
  border-color: var(--bs-color-brand-premium-gold);
}

.bs-platform:hover .bs-platform__arrow {
  color: var(--bs-color-brand-highlight-gold);
}

/* This page always renders the dark architectural treatment regardless of the resolved
   light/dark theme, so it cannot inherit the theme-scoped --bs-focus-ring: a light-theme
   ring would be near-invisible here. Gold is the one accent guaranteed to read on it. */
.bs-platform:focus-visible {
  outline: var(--bs-size-focus-ring) solid var(--bs-color-brand-highlight-gold);
  outline-offset: var(--bs-size-focus-offset);
}
</style>
