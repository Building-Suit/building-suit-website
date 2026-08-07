// Coming Soon copy (English + Arabic). Deliberately minimal — the task brief is explicit
// that this page should say almost nothing: brand name, status, and the one approved
// brand promise ("Clarity you can trust.", verbatim from
// 01-strategy/01_BRAND_FOUNDATION.md). Do not add marketing copy, features, or a
// different slogan without a repository-supported reason.

export interface LandingCopy {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  status: string;
  promise: string;
  logoAlt: string;
  skipToContent: string;
  mainLabel: string;
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
  },
};
