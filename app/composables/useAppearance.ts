export type AppearanceMode = "light" | "dark" | "system";
export type ResolvedAppearance = "light" | "dark";

interface AppearanceOptions {
  syncDocument?: boolean;
}

export function useAppearance(options: AppearanceOptions = {}) {
  const theme = useCookie<AppearanceMode>("bs-theme", {
    default: () => "system",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const systemPrefersDark = useState<boolean>("bs-system-prefers-dark", () => false);

  const resolvedTheme = computed<ResolvedAppearance>(() =>
    theme.value === "system" ? (systemPrefersDark.value ? "dark" : "light") : theme.value
  );

  const syncDocument = options.syncDocument ?? true;
  let mediaQuery: MediaQueryList | undefined;
  let stopThemeWatch: (() => void) | undefined;

  const applyToDocument = (value: ResolvedAppearance) => {
    if (!import.meta.client) return;
    document.documentElement.setAttribute("data-theme", value);
    document.documentElement.style.colorScheme = value;
  };

  const handleSystemChange = (event: MediaQueryListEvent) => {
    systemPrefersDark.value = event.matches;
  };

  onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemPrefersDark.value = mediaQuery.matches;
    mediaQuery.addEventListener("change", handleSystemChange);

    if (syncDocument) {
      stopThemeWatch = watch(resolvedTheme, applyToDocument, { immediate: true });
    }
  });

  onBeforeUnmount(() => {
    stopThemeWatch?.();
    mediaQuery?.removeEventListener("change", handleSystemChange);
  });

  function setTheme(value: AppearanceMode) {
    theme.value = value;
  }

  return { theme, resolvedTheme, setTheme };
}
