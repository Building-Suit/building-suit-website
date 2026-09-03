// The other Building Suit platforms surfaced on the Coming Soon page.
//
// Scope rule (same authority as landingCopy.ts): only list a platform that is publicly
// reachable today. Anything still described as "future ecosystem" in the brand docs —
// Shop Suit, Business Suit, City Suit — stays out of this file until it actually ships,
// and the copy test asserts that. No availability badges, no launch dates, no counts.

// Locale keys are spelled out here rather than imported from useLandingLocale: that
// composable already imports from this directory, and keeping content/ dependency-free
// avoids a module cycle for the sake of one union type.
export interface PlatformEntry {
  /** Stable key — used for :key and test selectors, never rendered. */
  id: string;
  /** Product name. Latin script in both locales, like the Building Suit wordmark. */
  name: string;
  /** One line, verbatim from the platform's own site. Not marketing copy we invented. */
  tagline: Record<"en" | "ar", string>;
  url: string;
}

export const platforms: PlatformEntry[] = [
  {
    id: "ledger-suit",
    name: "Ledger Suit",
    tagline: {
      en: "Business finance, clearly managed.",
      ar: "إدارة واضحة لماليات أعمالك.",
    },
    url: "https://ledger.building-suit.com/",
  },
];
