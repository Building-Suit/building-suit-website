import { describe, expect, it } from "vitest";
import { platforms } from "../app/content/platforms";

describe("platforms", () => {
  it("lists at least one platform (the rail renders nothing at all otherwise)", () => {
    expect(platforms.length).toBeGreaterThan(0);
  });

  it("uses stable, unique ids", () => {
    const ids = platforms.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("points every entry at an absolute https URL", () => {
    for (const platform of platforms) {
      expect(() => new URL(platform.url), platform.id).not.toThrow();
      expect(new URL(platform.url).protocol, platform.id).toBe("https:");
    }
  });

  it("carries a non-empty name and a tagline in both locales", () => {
    for (const platform of platforms) {
      expect(platform.name.trim().length, platform.id).toBeGreaterThan(0);
      for (const locale of ["en", "ar"] as const) {
        expect(platform.tagline[locale].trim().length, `${platform.id}.${locale}`).toBeGreaterThan(0);
      }
    }
  });

  it("does not list ecosystem products the brand docs describe as not yet available", () => {
    // Same authority as the prohibited-claims list in landingCopy.spec.ts: Shop/Business/
    // City Suit are documented as "future ecosystem". Listing one here would be a public
    // availability claim, which is exactly what that list exists to prevent.
    const unavailable = ["Shop Suit", "Business Suit", "City Suit"];
    const haystack = JSON.stringify(platforms).toLowerCase();
    for (const name of unavailable) {
      expect(haystack).not.toContain(name.toLowerCase());
    }
  });
});
