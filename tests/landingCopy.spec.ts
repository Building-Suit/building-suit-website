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
    // The rail heading names the brand too, and it stays Latin under RTL for the same
    // reason the wordmark does.
    expect(landingCopy.ar.platformsTitle).toContain("Building Suit");
  });

  it("uses the approved brand promise verbatim, not an invented slogan", () => {
    expect(landingCopy.en.promise).toBe("Clarity you can trust.");
  });

  it("is minimal: brand name, status, promise, and the platforms-rail labels only", () => {
    const allowedKeys = [
      "metaTitle",
      "metaDescription",
      "brandName",
      "status",
      "promise",
      "logoAlt",
      "skipToContent",
      "mainLabel",
      "platformsTitle",
      "platformsSubtitle",
      "newTabHint",
    ].sort();
    expect(Object.keys(landingCopy.en).sort()).toEqual(allowedKeys);
  });

  it("gives every locale a non-empty platforms heading, subtitle, and new-tab hint", () => {
    for (const locale of ["en", "ar"] as const) {
      for (const key of ["platformsTitle", "platformsSubtitle", "newTabHint"] as const) {
        expect(landingCopy[locale][key].trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
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
