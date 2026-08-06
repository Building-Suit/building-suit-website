import { describe, expect, it } from "vitest";
import { landingCopy } from "../app/content/landingCopy";

describe("landingCopy", () => {
  it("provides both en and ar locales with matching shape", () => {
    const en = landingCopy.en;
    const ar = landingCopy.ar;
    expect(Object.keys(en).sort()).toEqual(Object.keys(ar).sort());
    expect(en.pillars).toHaveLength(3);
    expect(ar.pillars).toHaveLength(3);
    expect(en.trustDescriptors).toHaveLength(3);
    expect(ar.trustDescriptors).toHaveLength(3);
  });

  it("keeps the Building Suit product name in Latin script in both locales", () => {
    expect(landingCopy.en.footerTagline).toContain("Building Suit");
    expect(landingCopy.ar.footerTagline).toContain("Building Suit");
    expect(landingCopy.ar.supporting).toContain("Building Suit");
  });

  it("never mentions prohibited scope (Paymob, provider directory, other Suits, launch date)", () => {
    const prohibited = ["Paymob", "provider directory", "Shop Suit", "Business Suit", "City Suit"];
    const haystack = JSON.stringify(landingCopy.en) + JSON.stringify(landingCopy.ar);
    for (const term of prohibited) {
      expect(haystack.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });
});
