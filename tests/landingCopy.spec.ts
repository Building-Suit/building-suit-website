import { describe, expect, it } from "vitest";
import { landingCopy } from "../app/content/landingCopy";

describe("landingCopy", () => {
  it("provides both en and ar locales with matching shape", () => {
    expect(Object.keys(landingCopy.en).sort()).toEqual(Object.keys(landingCopy.ar).sort());
  });

  it("keeps the Building Suit product name in Latin script in both locales", () => {
    expect(landingCopy.en.brandName).toBe("Building Suit");
    expect(landingCopy.ar.brandName).toBe("Building Suit");
    expect(landingCopy.en.metaDescription).toContain("Building Suit");
    expect(landingCopy.ar.metaDescription).toContain("Building Suit");
  });

  it("uses the approved brand promise verbatim, not an invented slogan", () => {
    expect(landingCopy.en.promise).toBe("Clarity you can trust.");
  });

  it("is minimal: no marketing copy fields beyond brand name, status, and promise", () => {
    const allowedKeys = [
      "metaTitle",
      "metaDescription",
      "brandName",
      "status",
      "promise",
      "logoAlt",
      "skipToContent",
      "mainLabel",
    ].sort();
    expect(Object.keys(landingCopy.en).sort()).toEqual(allowedKeys);
  });

  it("never mentions prohibited scope, features, or hype language", () => {
    const prohibited = [
      "Paymob",
      "provider directory",
      "Shop Suit",
      "Business Suit",
      "City Suit",
      "revolutionary",
      "world-class",
      "AI-powered",
      "waitlist",
      "download",
      "app store",
      "google play",
    ];
    const haystack = JSON.stringify(landingCopy.en) + JSON.stringify(landingCopy.ar);
    for (const term of prohibited) {
      expect(haystack.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });
});
