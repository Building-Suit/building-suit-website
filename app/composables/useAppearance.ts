export type AppearanceMode = "light" | "dark" | "system";
export type ResolvedAppearance = "light" | "dark";

// SSR-safe theme composable. Cookie name and resolution rule ("system" -> matchMedia)
// must stay in lockstep with the blocking pre-paint script in nuxt.config.ts.
export function useAppearance() {
  const theme = useCookie<AppearanceMode>("bs-theme", {
    default: () => "system",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const systemPrefersDark = useState<boolean>("bs-system-prefers-dark", () => false);

  const resolvedTheme = computed<ResolvedAppearance>(() =>
    theme.value === "system" ? (systemPrefersDark.value ? "dark" : "light") : theme.value
  );

  function applyToDocument(value: ResolvedAppearance) {
    if (!import.meta.client) return;
    document.documentElement.setAttribute("data-theme", value);
    document.documentElement.style.colorScheme = value;
  }

  if (import.meta.client) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    systemPrefersDark.value = mql.matches;
    mql.addEventListener("change", (event) => {
      systemPrefersDark.value = event.matches;
    });

    watch(resolvedTheme, applyToDocument, { immediate: true });
  }

  function setTheme(value: AppearanceMode) {
    theme.value = value;
  }

  return { theme, resolvedTheme, setTheme };
}
