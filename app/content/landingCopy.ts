// Approved Coming Soon copy (English + Arabic), verbatim from the product brief. Do not
// rewrite unless a source conflict makes a phrase inaccurate — see
// docs/building-suit-source-audit.md for the compliance check already performed against
// the PRD/BRD/UX spec (no conflicts found; copy used as supplied).

export interface Pillar {
  title: string;
  description: string;
}

export interface LandingCopy {
  metaTitle: string;
  metaDescription: string;
  status: string;
  eyebrow: string;
  headline: string;
  supporting: string;
  primaryAction: string;
  trustDescriptors: [string, string, string];
  signalLabels: [string, string, string];
  pillars: [Pillar, Pillar, Pillar];
  closingHeadline: string;
  closingSupporting: string;
  footerTagline: string;
  skipToContent: string;
  languageLabel: string;
  appearanceLabel: string;
  appearanceOptions: { light: string; dark: string; system: string };
}

export const landingCopy: Record<"en" | "ar", LandingCopy> = {
  en: {
    metaTitle: "Building Suit — A Clearer Way to Run Your Building | Coming Soon",
    metaDescription:
      "Building Suit is a transparent, mobile-first platform for managing building finances, residents, issues, announcements, and shared decisions. Coming soon.",
    status: "Coming Soon",
    eyebrow: "Building management, made clear",
    headline: "A clearer way to run your building is coming.",
    supporting:
      "Building Suit brings finances, issues, announcements, and shared decisions into one transparent, trusted place—built for the whole building.",
    primaryAction: "See what’s coming",
    trustDescriptors: ["Mobile-first", "Arabic and English", "Built around every unit"],
    signalLabels: ["Finances", "Community", "Decisions"],
    pillars: [
      {
        title: "Money you can trace",
        description: "See charges, payments, expenses, and balances in one clear, auditable history.",
      },
      {
        title: "Everything in its place",
        description:
          "Keep units, residents, issues, and announcements organised—not buried in scattered chats.",
      },
      {
        title: "Decisions everyone can trust",
        description: "Run clear, unit-based votes and preserve a dependable record of the building’s decisions.",
      },
    ],
    closingHeadline: "Clarity you can trust is coming home.",
    closingSupporting: "Building Suit is being built for buildings that want transparency, order, and continuity.",
    footerTagline: "Building Suit — the transparent way to run your building, together.",
    skipToContent: "Skip to content",
    languageLabel: "Language",
    appearanceLabel: "Appearance",
    appearanceOptions: { light: "Light", dark: "Dark", system: "System" },
  },
  ar: {
    metaTitle: "Building Suit — طريقة أوضح لإدارة مبناك | قريبًا",
    metaDescription:
      "Building Suit منصة شفافة مصممة للجوال أولًا لإدارة الشؤون المالية للمبنى والسكان والمشكلات والإعلانات والقرارات المشتركة. قريبًا.",
    status: "قريبًا",
    eyebrow: "إدارة المبنى، بوضوح",
    headline: "طريقة أوضح لإدارة مبناك… قريبًا.",
    supporting:
      "يجمع Building Suit الشؤون المالية والمشكلات والإعلانات والقرارات المشتركة في مكان واحد واضح وموثوق، صُمّم لكل سكان المبنى.",
    primaryAction: "اكتشف ما هو قادم",
    trustDescriptors: ["مصمم للجوال أولًا", "العربية والإنجليزية", "مبني حول كل وحدة"],
    signalLabels: ["الشؤون المالية", "المجتمع", "القرارات"],
    pillars: [
      {
        title: "شؤون مالية يمكنك تتبّعها",
        description: "تابع الرسوم والمدفوعات والمصروفات والأرصدة في سجل واحد واضح وقابل للمراجعة.",
      },
      {
        title: "كل شيء في مكانه",
        description: "حافظ على تنظيم الوحدات والسكان والمشكلات والإعلانات بدلًا من ضياعها داخل المحادثات المتفرقة.",
      },
      {
        title: "قرارات يثق بها الجميع",
        description: "أجرِ تصويتات واضحة مرتبطة بالوحدات واحتفظ بسجل موثوق لقرارات المبنى.",
      },
    ],
    closingHeadline: "الوضوح الذي يمكنك الوثوق به يقترب من منزلك.",
    closingSupporting: "يتم تطوير Building Suit للمباني التي تبحث عن الشفافية والنظام واستمرار المسؤولية.",
    footerTagline: "Building Suit — الطريقة الشفافة لإدارة مبناك، معًا.",
    skipToContent: "تخطَّ إلى المحتوى",
    languageLabel: "اللغة",
    appearanceLabel: "المظهر",
    appearanceOptions: { light: "فاتح", dark: "داكن", system: "النظام" },
  },
};
