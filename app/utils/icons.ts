// Central Hugeicons registry — Stroke Rounded set only, verified against the pinned
// @hugeicons/core-free-icons@4.2.3 export names. Import icons from here, never reach
// into @hugeicons/core-free-icons directly from a component.

import {
  CheckmarkBadge01Icon,
  Coins01Icon,
  ComputerIcon,
  Grid02Icon,
  LanguageSquareIcon,
  Moon02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";

export const icons = {
  pillarFinance: Coins01Icon,
  pillarOrganisation: Grid02Icon,
  pillarTrust: CheckmarkBadge01Icon,
  language: LanguageSquareIcon,
  themeLight: Sun01Icon,
  themeDark: Moon02Icon,
  themeSystem: ComputerIcon,
} as const;

export type IconName = keyof typeof icons;
