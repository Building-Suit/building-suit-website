// Central motion contract for the single-viewport Coming Soon experience.
//
// Timing/easing/distance/stagger values are the "complete Motion Spec" scale from
// .docs/03B.BUILDING_SUIT_MOTION_SPEC.md §3.1-3.2 (business-strengthening-checkpoint-07)
// — see docs/building-suit-source-audit.md for why that ref governs page-level
// structural motion over the shorter DTCG `motion.*` component tokens.

export const duration = {
  instant: 0,
  micro: 0.12,
  quick: 0.18,
  standard: 0.24,
  emphasized: 0.32,
  extended: 0.42,
} as const;

export const easing = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  standard: [0.2, 0, 0, 1],
  linear: [0, 0, 1, 1],
} as const;

export const distance = {
  microPx: 6,
  localPx: 14,
} as const;

export const stagger = {
  stepSeconds: 0.02, // 20ms per item, Motion Spec §3.4 (16-24ms band)
  maxItems: 4, // 4 * 20ms = 80ms accumulated cap
} as const;

export interface RevealStep {
  initial: false | { opacity: number; y?: number };
  animate: { opacity: number; y?: number };
  transition: { duration: number; ease: readonly number[]; delay: number };
}

// Every entrance element is built through this single function so reduced-motion
// correctness lives in one place. `initial: false` (skip animating from a from-state,
// render directly at `animate`) is resolved here rather than left to MotionConfig's own
// reducedMotion propagation timing — a prior page on this same site shipped a real bug
// where a Motion component's mount-time `initial` gate didn't retroactively respond to
// reduced-motion being resolved a tick after SSR hydration. Computing the branch
// ourselves, synchronously, from a directly-read useReducedMotion() ref removes that
// race entirely: there is nothing left for a later prop change to fail to undo.
export function revealStep(order: number, opts: { reducedMotion: boolean; travel?: number }): RevealStep {
  const travel = opts.travel ?? distance.localPx;
  const rest = { opacity: 0, y: travel };
  const settled = { opacity: 1, y: 0 };
  if (opts.reducedMotion) {
    return { initial: false, animate: settled, transition: { duration: duration.instant, ease: easing.standard, delay: 0 } };
  }
  return {
    initial: rest,
    animate: settled,
    transition: {
      duration: duration.standard,
      ease: easing.enter,
      delay: Math.min(order, stagger.maxItems) * stagger.stepSeconds,
    },
  };
}

// Phase 1 — environment: the background field resolves with a soft opacity fade only,
// no travel (it has no direction to travel from). standard/emphasized per §17 Phase 1.
export function environmentReveal(reducedMotion: boolean) {
  if (reducedMotion) {
    return { initial: false, animate: { opacity: 1 }, transition: { duration: duration.instant, ease: easing.standard, delay: 0 } };
  }
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: duration.emphasized, ease: easing.enter, delay: 0 },
  };
}

// Phase 2 — logo: 8-16px vertical settle + opacity, no scale, no bounce, no overshoot.
export function logoReveal(reducedMotion: boolean) {
  return revealStep(0, { reducedMotion, travel: distance.localPx });
}

// Phase 3 — brand text stack (wordmark, status, promise): small, fast stagger. Order
// starts at 1 so the logo (order 0) always settles at least one step ahead.
export function textReveal(index: number, reducedMotion: boolean) {
  return revealStep(index + 1, { reducedMotion, travel: distance.microPx + 2 });
}

// Phase 3b — the gold hairline separating the brand promise from the platforms rail.
// A rule has no meaningful "from" position to travel from, so it draws itself outward
// from the centre (scaleX) instead. `extended` because a line that draws slower than the
// text it separates reads as deliberate rather than as a fourth staggered text item.
export interface RuleRevealStep {
  initial: false | { opacity: number; scaleX: number };
  animate: { opacity: number; scaleX: number };
  transition: { duration: number; ease: readonly number[]; delay: number };
}

export function ruleReveal(reducedMotion: boolean): RuleRevealStep {
  const settled = { opacity: 1, scaleX: 1 };
  if (reducedMotion) {
    return { initial: false, animate: settled, transition: { duration: duration.instant, ease: easing.standard, delay: 0 } };
  }
  return {
    initial: { opacity: 0, scaleX: 0 },
    animate: settled,
    transition: { duration: duration.extended, ease: easing.enter, delay: stagger.maxItems * stagger.stepSeconds },
  };
}

// Phase 4 — the other-platforms rail. Continues the same stagger sequence after the brand
// text stack (which occupies orders 1-3), so the rail reads as the last beat of one
// entrance rather than as a second, separate animation. Orders at or past
// `stagger.maxItems` all share one delay by design (§3.4's 80ms accumulated cap) — a rail
// of N platforms resolves as a single group, not as an ever-lengthening cascade.
export const railFirstOrder = 4;

export function platformReveal(index: number, reducedMotion: boolean) {
  return revealStep(railFirstOrder + index, { reducedMotion, travel: distance.microPx + 2 });
}

// Hover / press — consumed by the platform cards in PlatformsRail.vue, which bind these
// through CSS custom properties so the contract stays the single source of truth even
// where the interaction itself is expressed in CSS. Motion Spec §7.1.
export const hoverScale = 1.015;
export const pressScale = 0.98;
export const hoverTransition = { duration: duration.micro, ease: easing.standard };

// Section 18 — optional pointer parallax on desktop pointer-fine devices only. Travel
// is deliberately tiny (3-10px) and never applied to the logo, text, or the platforms
// rail. Smoothed with a spring so it reads as "gently responds," not tracked 1:1.
export const parallaxMaxPx = 8;
export const parallaxSpring = { stiffness: 40, damping: 18, mass: 0.6 };
