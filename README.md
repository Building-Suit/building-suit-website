# Building Suit — Website

Production Nuxt 4 / Vue 3 / TypeScript application for the Building Suit marketing website. Currently ships one page: the bilingual (English/Arabic) "Coming Soon" landing page.

This repository is **not** the `tareq-abdelwhap/building-suit` design-system/product-documentation repository — it consumes canonical design tokens and copy from that repository (see `docs/building-suit-source-audit.md` for exact refs/commits) but owns its own production build, tests, and deploy story independently.

## Stack

Nuxt 4, Vue 3, TypeScript (strict), `motion-v` for animation, local `@fontsource` packages (no font CDN), Hugeicons Stroke Rounded, plain CSS custom properties generated from the canonical design tokens. No component library, no Tailwind, no second animation/icon system.

## Getting started

```bash
pnpm install
pnpm dev              # http://localhost:3000
```

## Design-token sync

`design-system/design-tokens.source.json` is a vendored, byte-identical copy of the canonical DTCG token file from the source repository (provenance recorded in `design-system/PROVENANCE.md`). `app/assets/css/building-suit-tokens.css` is generated from it — never hand-edit that file.

```bash
pnpm tokens:sync      # regenerate the CSS layer + design-system.lock.json from the vendored JSON
pnpm tokens:verify     # confirm the generated CSS, lock file, and logo assets are all still in sync,
                       # and that no component hardcodes a raw hex color
```

To pull a newer canonical token version, a maintainer with access to the source repository re-copies `design-tokens.source.json` from the approved ref and reruns `pnpm tokens:sync`.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test             # vitest — motion contract + copy content checks
pnpm build
pnpm test:e2e          # playwright — builds nothing itself, runs against `.output` via the
                       # webServer config, so `pnpm build` must run first
```

`pnpm test:e2e` includes automated accessibility scans (`@axe-core/playwright`, WCAG 2 A/AA) across all four locale×theme combinations, in addition to functional/keyboard/SSR/reduced-motion coverage.

## Evidence and reference docs

- `docs/building-suit-source-audit.md` — exact source refs/commit SHAs and authority resolution used for this build.
- `docs/motion-mcp-audit.md` — Motion tooling audit, including the API surface actually verified against the installed `motion-v` package.
- `docs/visual-qa.md` — design/composition/copy/motion/accessibility review, Lighthouse results, and known remaining issues.
- `test-results/visual-evidence/` — fixed-viewport screenshots across locale, theme, device, and reduced-motion.

Regenerate evidence after a change:

```bash
pnpm build
PORT=3412 node .output/server/index.mjs &
node scripts/capture-visual-evidence.mjs
```

## Project layout

```text
app/
  pages/index.vue                Coming Soon page (SEO meta, structured data)
  components/landing/            Header, hero, architectural signal, pillars, closing, footer
  components/controls/           Language and appearance (theme) controls
  composables/                   useAppearance (SSR-safe theme), useLandingLocale (SSR-safe locale)
  content/landingCopy.ts         Approved EN/AR copy
  utils/buildingSuitMotion.ts    Central motion contract (durations, easings, reveal helpers)
  utils/icons.ts                 Central Hugeicons registry
  plugins/hugeicons.ts           Global <HugeiconsIcon> registration
  assets/css/                    Generated tokens, reset, base, landing layout primitives
design-system/                   Vendored canonical tokens + provenance
scripts/                         Token sync/verify, OG/logo asset generation, evidence capture
tests/                           Vitest unit tests + Playwright e2e/accessibility suite
docs/                            Source audit, motion audit, visual QA
```
