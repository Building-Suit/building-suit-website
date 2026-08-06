// Central motion contract for the Coming Soon page.
//
// Values are the "complete Motion Spec" scale from .docs/03B.BUILDING_SUIT_MOTION_SPEC.md
// §3.1–3.2 (checkpoint-07), not the shorter DTCG `motion.*` component tokens — see
// docs/building-suit-source-audit.md, contradiction #2, for why that ref wins for
// page-level structural motion.

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
  localPx: 16,
} as const;

export const stagger = {
  stepSeconds: 0.02,
  maxItems: 4, // 4 * 20ms = 80ms accumulated cap (Motion Spec §3.4)
} as const;

// Hero entrance — Motion Spec §5.3 viewport-reveal distances, `standard + enter`.
export const heroStatus = {
  initial: { opacity: 0, y: distance.microPx },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.standard, ease: easing.enter, delay: 0 },
};

export const heroHeadline = {
  initial: { opacity: 0, y: distance.localPx },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.standard, ease: easing.enter, delay: stagger.stepSeconds },
};

export const heroSupporting = {
  initial: { opacity: 0, y: distance.microPx + 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.standard, ease: easing.enter, delay: stagger.stepSeconds * 2 },
};

export const heroCta = {
  initial: { opacity: 0, y: distance.microPx },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.standard, ease: easing.enter, delay: stagger.stepSeconds * 3 },
};

export const heroVisual = {
  initial: { opacity: 0, y: distance.microPx },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.emphasized, ease: easing.enter, delay: stagger.stepSeconds * 2 },
};

export function trustDescriptorDelay(index: number) {
  return stagger.stepSeconds * 4 + Math.min(index, stagger.maxItems) * stagger.stepSeconds;
}

// Viewport reveal for newly-encountered content (pillars, closing) — Motion Spec §5.3:
// trigger once, start no farther than 8–16px from rest, `standard + enter`.
//
// Deliberately built on useInView() + a reactive `:animate` prop rather than the Motion
// component's own `:while-in-view`. `initial` is a mount-time-only prop in this library
// (matching Framer Motion's contract), so on an SSR page the reduced-motion state isn't
// known yet at first client mount and a later prop swap to bypass `whileInView` never
// takes effect — the intersection gate had already locked in. `animate`, unlike
// `initial`, IS reactive after mount, so branching the reveal that way is what actually
// satisfies Motion Spec §8: "Viewport reveal -> Content appears immediately" under
// reduced motion, with no scroll required.
export function revealItemMotion(index: number, shouldReveal: boolean) {
  const rest = { opacity: 0, y: distance.localPx };
  return {
    initial: rest,
    animate: shouldReveal ? { opacity: 1, y: 0 } : rest,
    transition: {
      duration: duration.standard,
      ease: easing.enter,
      delay: Math.min(index, stagger.maxItems) * stagger.stepSeconds,
    },
  };
}

// Header surface transition (transparent hero -> solid scrolled surface) — `quick`, no layout reflow.
export const headerSurfaceTransition = {
  duration: duration.quick,
  ease: easing.standard,
};

// Hover / press — Motion Spec §7.1.
export const hoverScale = 1.015;
export const pressScale = 0.98;

export const hoverTransition = { duration: duration.micro, ease: easing.standard };
export const pressTransition = { duration: duration.micro, ease: easing.standard };

// Decorative parallax on the architectural signal — Motion Spec §5.4: 2–6% of viewport, never on
// text/controls, disabled under reduced motion (enforced by the component, not here).
export const parallaxRangePx = 18;
