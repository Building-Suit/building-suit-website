import { describe, expect, it } from "vitest";
import {
  duration,
  easing,
  heroCta,
  heroHeadline,
  heroStatus,
  revealItemMotion,
  stagger,
  trustDescriptorDelay,
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

  it("hero entrance uses standard/enter with local-travel distances (8-24px)", () => {
    expect(heroHeadline.initial.y).toBeGreaterThanOrEqual(8);
    expect(heroHeadline.initial.y).toBeLessThanOrEqual(24);
    expect(heroHeadline.transition.duration).toBe(duration.standard);
    expect(heroHeadline.transition.ease).toEqual(easing.enter);
  });

  it("hero status uses micro-travel distance (4-8px)", () => {
    expect(heroStatus.initial.y).toBeGreaterThanOrEqual(4);
    expect(heroStatus.initial.y).toBeLessThanOrEqual(8);
  });

  it("CTA entrance never exceeds the emphasized duration ceiling used across the hero", () => {
    expect(heroCta.transition.duration).toBeLessThanOrEqual(duration.emphasized);
  });

  it("trust descriptor stagger stays within the 80ms accumulated cap (Motion Spec §3.4)", () => {
    const delays = [0, 1, 2, 3, 4, 5].map(trustDescriptorDelay);
    const spread = delays[delays.length - 1] - delays[0];
    expect(spread).toBeLessThanOrEqual(stagger.maxItems * stagger.stepSeconds + 0.001);
  });

  it("viewport reveal starts within 8-16px of rest and only animates once shouldReveal is true (Motion Spec §5.3)", () => {
    const notYet = revealItemMotion(0, false);
    expect(notYet.initial.y).toBeGreaterThanOrEqual(8);
    expect(notYet.initial.y).toBeLessThanOrEqual(16);
    expect(notYet.animate.opacity).toBe(0);

    const revealed = revealItemMotion(0, true);
    expect(revealed.animate).toEqual({ opacity: 1, y: 0 });
  });

  it("reveal appears immediately under reduced motion — shouldReveal bypasses the intersection gate", () => {
    // The reduced-motion contract (Motion Spec §8) is satisfied by callers passing
    // shouldReveal = isInView || reducedMotion, not by this function itself; verify the
    // bypass path renders the settled state regardless of index/stagger.
    const step = revealItemMotion(2, true);
    expect(step.animate).toEqual({ opacity: 1, y: 0 });
  });

  it("viewport reveal stagger step delay increases monotonically and caps at stagger.maxItems", () => {
    const a = revealItemMotion(0, true).transition.delay;
    const b = revealItemMotion(1, true).transition.delay;
    const capped = revealItemMotion(99, true).transition.delay;
    expect(b).toBeGreaterThan(a);
    expect(capped).toBe(revealItemMotion(stagger.maxItems, true).transition.delay);
  });
});
