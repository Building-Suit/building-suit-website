// Central Hugeicons registry — Stroke Rounded set only, verified against the pinned
// @hugeicons/core-free-icons@4.2.3 export names. Import icons from here, never reach
// into @hugeicons/core-free-icons directly from a component.
//
// Kept minimal: the Coming Soon page itself renders no icons (typography + logo only).
// These remain for AppearanceControl/LanguageControl, which are preserved as
// not-currently-rendered infrastructure — see FutureActionsSlot.vue.

import { ComputerIcon, LanguageSquareIcon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";

export const icons = {
  language: LanguageSquareIcon,
  themeLight: Sun01Icon,
  themeDark: Moon02Icon,
  themeSystem: ComputerIcon,
} as const;

export type IconName = keyof typeof icons;
