import { describe, expect, it } from "vitest";
import {
  distance,
  duration,
  easing,
  environmentReveal,
  logoReveal,
  parallaxMaxPx,
  platformReveal,
  railFirstOrder,
  revealStep,
  ruleReveal,
  stagger,
  textReveal,
} from "../app/utils/buildingSuitMotion";

describe("buildingSuitMotion", () => {
  it("matches the Motion Spec §3.1 duration scale exactly", () => {
    expect(duration).toEqual({
      instant: 0,
      micro: 0.12,
      quick: 0.18,
      standard: 0.24,
      emphasized: 0.32,
      extended: 0.42,
    });
  });

  it("matches the Motion Spec §3.2 easing curves exactly", () => {
    expect(easing.enter).toEqual([0.16, 1, 0.3, 1]);
    expect(easing.exit).toEqual([0.4, 0, 1, 1]);
    expect(easing.standard).toEqual([0.2, 0, 0, 1]);
    expect(easing.linear).toEqual([0, 0, 1, 1]);
  });

  it("environment reveal (Phase 1) is an opacity-only fade with no travel", () => {
    const step = environmentReveal(false);
    expect(step.initial).toEqual({ opacity: 0 });
    expect(step.animate).toEqual({ opacity: 1 });
    expect(step.transition.duration).toBeLessThanOrEqual(duration.emphasized);
  });

  it("logo reveal (Phase 2) settles from 8-16px with no scale field present", () => {
    const step = logoReveal(false);
    expect(step.initial).not.toBe(false);
    if (step.initial === false) throw new Error("unreachable");
    expect(step.initial.y).toBeGreaterThanOrEqual(8);
    expect(step.initial.y).toBeLessThanOrEqual(16);
    expect(step.animate).toEqual({ opacity: 1, y: 0 });
    expect(step.transition.ease).toEqual(easing.enter);
    expect("scale" in step.animate).toBe(false);
  });

  it("text reveal (Phase 3) stays within the 80ms accumulated stagger cap", () => {
    const delays = [0, 1, 2, 3, 4, 5].map((i) => textReveal(i, false).transition.delay);
    const spread = delays[delays.length - 1] - delays[0];
    expect(spread).toBeLessThanOrEqual(stagger.maxItems * stagger.stepSeconds + 0.001);
  });

  it("text reveal delay increases monotonically and caps at stagger.maxItems", () => {
    const a = textReveal(0, false).transition.delay;
    const b = textReveal(1, false).transition.delay;
    const capped = textReveal(99, false).transition.delay;
    expect(b).toBeGreaterThan(a);
    expect(capped).toBe(textReveal(stagger.maxItems - 1, false).transition.delay);
  });

  it("rule reveal (Phase 3b) draws outward with scaleX and settles fully open", () => {
    const step = ruleReveal(false);
    expect(step.initial).toEqual({ opacity: 0, scaleX: 0 });
    expect(step.animate).toEqual({ opacity: 1, scaleX: 1 });
    expect(step.transition.ease).toEqual(easing.enter);
    expect(step.transition.duration).toBeLessThanOrEqual(duration.extended);
  });

  it("platform reveal (Phase 4) starts after the brand text stack and shares one delay", () => {
    expect(railFirstOrder).toBeGreaterThan(textReveal(2, false).transition.delay / stagger.stepSeconds);
    const first = platformReveal(0, false).transition.delay;
    const later = platformReveal(7, false).transition.delay;
    expect(first).toBeGreaterThanOrEqual(textReveal(2, false).transition.delay);
    // Past the accumulated-stagger cap, an N-item rail must not turn into an N-step
    // cascade — every card lands together.
    expect(later).toBe(first);
    expect(first).toBeLessThanOrEqual(stagger.maxItems * stagger.stepSeconds + 0.001);
  });

  it("every phase renders immediately (initial: false, instant transition) under reduced motion", () => {
    for (const step of [
      environmentReveal(true),
      logoReveal(true),
      textReveal(0, true),
      textReveal(3, true),
      ruleReveal(true),
      platformReveal(0, true),
      platformReveal(5, true),
    ]) {
      expect(step.initial).toBe(false);
      expect(step.transition.duration).toBe(duration.instant);
      expect(step.animate.opacity).toBe(1);
    }
  });

  it("revealStep never produces a non-zero rest y under reduced motion (nothing left mid-travel)", () => {
    const step = revealStep(2, { reducedMotion: true, travel: distance.localPx });
    expect(step.animate.y).toBe(0);
  });

  it("parallax travel stays within the documented low-amplitude budget", () => {
    // Motion Spec §5.4 allows roughly 2-6% of viewport for decorative parallax; this is a
    // fixed small px budget deliberately well under that for a "barely perceptible" feel.
    expect(parallaxMaxPx).toBeGreaterThan(0);
    expect(parallaxMaxPx).toBeLessThanOrEqual(10);
  });
});
