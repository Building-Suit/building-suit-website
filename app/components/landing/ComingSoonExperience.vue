<script setup lang="ts">
import { ruleReveal } from "~/utils/buildingSuitMotion";

const reducedMotion = useSafeReducedMotion();

// The hairline belongs to the composition, not to either register: it sits at the midpoint
// of the gap between them, which is why it lives here rather than inside BrandIdentity or
// PlatformsRail. Anchored to one of the two, the same gap read as one large void with a
// decoration stuck to its top edge.
const rule = computed(() => ruleReveal(reducedMotion.value));
</script>

<template>
  <div class="bs-experience">
    <LandingArchitecturalAtmosphere />

    <div class="bs-experience__spacer bs-experience__spacer--top" aria-hidden="true" />

    <LandingBrandIdentity />

    <div class="bs-experience__spacer bs-experience__spacer--gap" aria-hidden="true" />

    <Motion as="div" class="bs-experience__rule" aria-hidden="true" v-bind="rule" />

    <div class="bs-experience__spacer bs-experience__spacer--gap" aria-hidden="true" />

    <LandingPlatformsRail />

    <div class="bs-experience__spacer bs-experience__spacer--bottom" aria-hidden="true" />
  </div>
</template>

<style scoped>
.bs-experience {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  overflow: hidden;
  padding-inline: max(env(safe-area-inset-left), 24px) max(env(safe-area-inset-right), 24px);
  padding-block-start: max(env(safe-area-inset-top), 20px);
  padding-block-end: max(env(safe-area-inset-bottom), 20px);
  background: var(--bs-color-role-dark-background);
}

/* Flexible spacers, not fixed margins: the page has a hard no-scroll requirement at every
   supported size (tests/e2e/no-scroll.spec.ts), so leftover height gets distributed rather
   than accumulated. The two --gap spacers are equal by design, so the hairline between
   them always lands on the optical midpoint between the brand cluster and the rail. */
.bs-experience__spacer--top {
  flex: 0.95 0 0;
  min-height: 8px;
}

.bs-experience__spacer--gap {
  flex: 0.5 0 0;
  min-height: clamp(10px, 1.8dvh, 28px);
}

.bs-experience__spacer--bottom {
  flex: 0.55 0 0;
  min-height: 8px;
}

/* Symmetric gradient, so it needs no RTL mirroring.
   position/z-index are load-bearing, not decoration: ArchitecturalAtmosphere is an
   absolutely-positioned sibling, so any static in-flow element here paints underneath it
   and simply disappears. Every other foreground child carries the same pair. */
.bs-experience__rule {
  position: relative;
  z-index: 1;
  width: clamp(56px, 10vw, 120px);
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--bs-color-brand-premium-gold) 50%,
    transparent 100%
  );
}
</style>
