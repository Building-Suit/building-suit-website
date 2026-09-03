# Building Suit — Website

Production Nuxt 4 / Vue 3 / TypeScript application for the Building Suit marketing website. Currently ships one page: a single-viewport, no-scroll "Coming Soon" brand experience (bilingual English/Arabic) in two registers — the brand cluster (logo, "Coming Soon," and the brand promise "Clarity you can trust.") above a gold hairline, and below it a rail linking the other live Building Suit platforms.

The whole page still fits one viewport at every supported size; the platforms rail replaced the reserved-but-empty actions region rather than adding a second screen.

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

`pnpm test:e2e` includes automated accessibility scans (`@axe-core/playwright`, WCAG 2 A/AA) in English and Arabic, a dedicated no-scroll regression suite (`tests/e2e/no-scroll.spec.ts`) across 13 viewports × 2 reading directions, and reduced-motion coverage — in addition to functional/keyboard/SSR checks.

## Evidence and reference docs

- `docs/building-suit-source-audit.md` — exact source refs/commit SHAs and authority resolution used for this build.
- `docs/motion-mcp-audit.md` — Motion tooling audit, including the API surface actually verified against the installed `motion-v` package.
- `docs/visual-qa.md` — design/composition/copy/motion/accessibility review, Lighthouse results, and known remaining issues.
- `test-results/visual-evidence/` — fixed-viewport screenshots across device size, locale, and reduced-motion.

Regenerate evidence after a change:

```bash
pnpm build
PORT=3412 node .output/server/index.mjs &
node scripts/capture-visual-evidence.mjs
```

## Project layout

```text
app/
  pages/index.vue                       Coming Soon page (SEO meta, structured data)
  components/landing/
    ComingSoonExperience.vue            Root composition: dvh/svh sizing, safe-area insets, flexible
                                         spacers, and the gold hairline dividing the two registers
    ArchitecturalAtmosphere.vue         Decorative background: charcoal/navy field, window-grid, gold halo, pointer parallax
    BrandIdentity.vue                   Logo + wordmark + "Coming Soon" (h1) + brand promise
    PlatformsRail.vue                   "More from Building Suit." (h2) + one link card per platform
  components/controls/                  Language + appearance controls — preserved infrastructure,
                                         not rendered on this page (no visible chrome, task requirement)
  composables/
    useAppearance.ts                    SSR-safe theme (dormant on this page — see docs/visual-qa.md)
    useLandingLocale.ts                 SSR-safe locale/dir
    useSafeReducedMotion.ts             Hydration-safe wrapper around motion-v's useReducedMotion()
  content/landingCopy.ts                Minimal EN/AR copy (brand name, status, promise, rail labels)
  content/platforms.ts                  The other Building Suit platforms shown in the rail —
                                         publicly-reachable products only, see the file header
  utils/buildingSuitMotion.ts           Central motion contract (durations, easings, phase-based reveal helpers)
  utils/icons.ts                        Central Hugeicons registry (controls only; this page renders no icons)
  plugins/hugeicons.ts                  Global <HugeiconsIcon> registration
  assets/css/                           Generated tokens, reset, base, page-shell rules
design-system/                          Vendored canonical tokens + provenance
scripts/                                Token sync/verify, OG/logo/favicon generation, evidence capture
tests/
  e2e/landing.spec.ts                   Accessibility, SSR, keyboard, reduced motion, landmarks
  e2e/no-scroll.spec.ts                 Hard no-scroll regression across 13 viewports × 2 directions
  *.spec.ts                             Vitest unit tests (motion contract, copy content, platform data)
docs/                                   Source audit, motion audit, visual QA
```
