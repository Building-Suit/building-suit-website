import { landingCopy } from "~/content/landingCopy";

export type LandingLocale = "en" | "ar";

export function useLandingLocale() {
  const cookie = useCookie<LandingLocale>("bs-lang", {
    default: () => "en",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // `useCookie`'s `default` only fills in a *missing* cookie at read time. It does not
  // sanitise a present-but-unrecognised value, and on the client the ref goes to
  // null/undefined the moment the cookie is deleted mid-session (privacy extension, a
  // manual clear, an expiry landing between two renders). Indexing landingCopy with that
  // raw value yields `undefined`, and the very next property read — `copy.skipToContent`
  // in app.vue — throws, taking the whole page down. Everything downstream therefore
  // reads this narrowed ref, never the cookie ref directly.
  const locale = computed<LandingLocale>(() => (cookie.value === "ar" ? "ar" : "en"));

  const dir = computed<"ltr" | "rtl">(() => (locale.value === "ar" ? "rtl" : "ltr"));
  const copy = computed(() => landingCopy[locale.value]);

  function setLocale(value: LandingLocale) {
    cookie.value = value;
  }

  return { locale, dir, copy, setLocale };
}
