import { HugeiconsIcon } from "@hugeicons/vue";

// Registers the single Hugeicons render component globally so every section can use
// <HugeiconsIcon :icon="icons.xyz" /> without a per-file import (icon data itself still
// comes only from app/utils/icons.ts — the central registry).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("HugeiconsIcon", HugeiconsIcon);
});
