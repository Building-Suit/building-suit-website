// Coming Soon copy (English + Arabic). Deliberately minimal — brand name, status, the one
// approved brand promise ("Clarity you can trust.", verbatim from
// 01-strategy/01_BRAND_FOUNDATION.md), and the labels for the other-platforms rail. Do
// not add feature copy, hype vocabulary, or a different slogan without a
// repository-supported reason; tests/landingCopy.spec.ts enforces both the key list and
// the prohibited-claims list.

export interface LandingCopy {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  status: string;
  promise: string;
  logoAlt: string;
  skipToContent: string;
  mainLabel: string;
  /** Heading above the other-platforms rail. */
  platformsTitle: string;
  /** One supporting line under it. */
  platformsSubtitle: string;
  /** Screen-reader-only suffix on each platform link — every one opens a new tab. */
  newTabHint: string;
}

export const landingCopy: Record<"en" | "ar", LandingCopy> = {
  en: {
    metaTitle: "Building Suit — Coming Soon",
    metaDescription: "Building Suit is coming soon. Clarity you can trust.",
    brandName: "Building Suit",
    status: "Coming Soon",
    promise: "Clarity you can trust.",
    logoAlt: "Building Suit",
    skipToContent: "Skip to content",
    mainLabel: "Building Suit — Coming Soon",
    platformsTitle: "More from Building Suit.",
    platformsSubtitle: "Other platforms and systems we run.",
    newTabHint: "opens in a new tab",
  },
  ar: {
    metaTitle: "Building Suit — قريبًا",
    metaDescription: "Building Suit قريبًا. وضوح تثق به.",
    brandName: "Building Suit",
    status: "قريبًا",
    promise: "وضوح تثق به.",
    logoAlt: "Building Suit",
    skipToContent: "تخطَّ إلى المحتوى",
    mainLabel: "Building Suit — قريبًا",
    // No trailing full stop, unlike the English: the heading ends with a Latin run, and
    // bidi reordering pushes a neutral period to the far left of the line where it reads
    // as detached punctuation rather than as the end of the sentence.
    platformsTitle: "المزيد من Building Suit",
    platformsSubtitle: "منصّات وأنظمة أخرى نُشغّلها.",
    newTabHint: "يفتح في تبويب جديد",
  },
};
