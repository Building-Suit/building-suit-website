import { landingCopy } from "~/content/landingCopy";

export type LandingLocale = "en" | "ar";

export function useLandingLocale() {
  const locale = useCookie<LandingLocale>("bs-lang", {
    default: () => "en",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const dir = computed<"ltr" | "rtl">(() => (locale.value === "ar" ? "rtl" : "ltr"));
  const copy = computed(() => landingCopy[locale.value]);

  function setLocale(value: LandingLocale) {
    locale.value = value;
  }

  return { locale, dir, copy, setLocale };
}
