# Visual QA — Single-Viewport Coming Soon Experience

Reviewed against the task brief's quality bar (§36) and the source repository's own brand rules. Evidence screenshots referenced below live in `test-results/visual-evidence/`.

## Brand

- **Unmistakably Building Suit?** Yes — the unmodified 3D logo (light/silver variant, correct for the dark hero per `02_LOGO_USAGE_RULES.md`) is the visual anchor; Building Navy appears as one controlled radial presence, not a wash; Premium Gold appears exactly once as a large focal element (the halo directly behind the logo) plus nothing else gold on the page — no second gold element competes with it.
- **Premium?** Confirmed by the "disable all animation" test: `reduced-motion-1440x900.png` and `reduced-motion-390x844.png` show the exact same composition, fully settled, with zero loss of quality — the premium read comes from typography, spacing, and the logo, not the motion.
- **Restraint (gold scarcity)?** Exactly one gold element exists in the DOM's visual output: the halo. Grep-verified: `grep -rn "premium-gold\|highlight-gold\|gold300\|EBB45A\|D89B42" app/components/` returns only the one `.bs-atmosphere__glow` background and the logo's own baked-in gold windows (part of the untouched image asset, not CSS).
- **Futuristic via composition, not gimmicks?** No neon, no particles, no 3D tilt, no glassmorphism, no chrome text, no scanlines — confirmed by re-reading the task's "strictly forbidden" list (§37) against every component file; none of those techniques appear anywhere in the codebase.
- **Serious enough for money/governance, still warm?** Navy/charcoal base with precise typography reads institutional; the single warm gold light and the logo's own "lit window" motif keep it human, matching `01_LOGO_ANALYSIS.md`'s "warmth via gold" reading.

## Composition

- **One unmistakable focal point?** The gold halo, the logo, and "Coming Soon" form a single vertical axis; the platforms rail below is deliberately set in a quieter register (smaller type, muted colour, no halo) so it reads as a secondary destination and never competes for the focal point — verified visually across all ten evidence screenshots.
- **Bias above center, not dead-centered?** The brand cluster sits in the ~21-52% vertical zone (flex ratios 0.95 / 0.5 / 0.5 / 0.55 across the four spacers in `ComingSoonExperience.vue`), so the page reads top-weighted rather than mathematically centered.
- **Negative space intentional, not empty?** The gap between the two registers is split into two equal flexible spacers with the gold hairline on the midpoint between them. That is what makes the space read as a deliberate division rather than as a void: an earlier revision anchored the same hairline to the bottom of the brand cluster and the identical amount of empty height immediately read as unfinished.
- **No clipping at any tested size?** Confirmed by `tests/e2e/no-scroll.spec.ts` — see the Responsive QA table below — and by reading every evidence screenshot at full resolution, not just the automated metrics.

## Copy

- Three lines of brand content plus the wordmark ("Building Suit," "Coming Soon," "Clarity you can trust."), then the rail's two labels and one line per platform — no feature list, no email field, no countdown, no store badges. `tests/landingCopy.spec.ts` asserts the copy object has no keys beyond `metaTitle/metaDescription/brandName/status/promise/logoAlt/skipToContent/mainLabel/platformsTitle/platformsSubtitle/newTabHint`, and greps for a list of prohibited terms (Paymob, provider directory, other Suit portals, "revolutionary," "AI-powered," "waitlist," "download," "app store," "google play").
- Platform taglines are quoted from each platform's own site, not written here; `tests/platforms.spec.ts` additionally blocks any entry naming Shop/Business/City Suit, since the brand docs describe those as future ecosystem and listing one would be an availability claim.
- The Arabic rail heading drops the trailing full stop the English one carries. It ends with a Latin run ("Building Suit"), and bidi reordering moves a neutral period to the far left of the line, where it reads as detached punctuation rather than as the end of the sentence.
- "Clarity you can trust." is the verbatim approved brand promise from `01_BRAND_FOUNDATION.md` (§ Brand promise) — not a paraphrase, checked by direct string comparison in the same test file.
- Arabic ("قريبًا" / "وضوح تثق به.") is a natural MSA rendering of the same two lines, not a literal word-for-word translation — verified visually in `ar-mobile-390x844.png` / `ar-desktop-1440x900.png`.

## Motion

- Five-phase entrance (environment → logo → text stagger → hairline draw → platforms rail → stillness); the first three are unchanged from task §17, and the two added phases reuse the same `revealStep` helper so reduced-motion correctness still lives in exactly one place. See `docs/motion-mcp-audit.md` for the full breakdown and the API-level evidence.
- The rail does not cascade card-by-card: past `stagger.maxItems` every order shares one delay (Motion Spec §3.4's 80ms accumulated cap), so an N-platform rail lands as a single group. Asserted in `tests/buildingSuitMotion.spec.ts`.
- Resting state is genuinely still: no looping/pulsing/floating animation exists anywhere (confirmed by reading every component; the only continuous listener is a passive `pointermove` handler that only ever produces an 8px-max spring-smoothed offset on decorative background layers).
- Pointer parallax never touches the logo, text, or the platforms rail — grep-verified (`x:`/`y:` motion-value bindings only appear on `.bs-atmosphere__*` selectors).
- Card hover/press is a CSS transition rather than a JS animation (a persistent hover state needs no animation loop), but the scale and duration values are bound in from `buildingSuitMotion.ts` through custom properties, so the motion contract stays the single source of truth. It is additionally gated behind `(hover: hover) and (prefers-reduced-motion: no-preference)`.
- Reduced motion is Playwright-verified end to end, and this pass caught a real hydration-mismatch bug in the process rather than assuming the naive implementation was correct — see `docs/motion-mcp-audit.md` bug #3.

## Accessibility

- **Automated:** `@axe-core/playwright`, WCAG 2 A+AA tags, English and Arabic — **zero violations** (`pnpm test:e2e`, "automated accessibility" suite).
- **Semantic structure:** exactly one `<h1>` ("Coming Soon") and exactly one `<h2>` (the rail heading) with no skipped level, one `<main id="main-content">` landmark with an accessible name, and no `<header>`/`<footer>`/`<nav>` — the rail is a `<section>` labelled by its own heading, not site navigation. All asserted by test, not just visually inspected.
- **Keyboard:** tab order is the skip link, then each platform link in document order, then out of the page; every one of them receives a visible, non-`none` computed outline with a non-zero width. The rail sets its focus ring to Highlight Gold explicitly rather than inheriting `--bs-focus-ring`, because this page always renders the dark treatment regardless of the resolved light/dark theme and a light-theme ring would be near-invisible on it. Asserted by test.
- **External links:** every platform link is absolute `https`, `target="_blank"`, and carries `rel="noopener noreferrer"` (reverse-tabnabbing), with a visually-hidden "(opens in a new tab)" suffix so the target change is announced. Asserted by test in both the DOM and the copy layer.
- **No automatic focus movement on load** — asserted by test.
- **Decorative content excluded from the accessibility tree:** `ArchitecturalAtmosphere`'s root carries `aria-hidden="true"` — asserted by test.
- **Logo alt text:** `alt="Building Suit"` (or `"Building Suit"` in Arabic renders — the name itself stays Latin per brand voice rules even in the Arabic tree) rather than empty or decorative.
- **Contrast:** primary text is white/near-white on a near-black background (Neutral 950/900) — far in excess of the 4.5:1 AA target; the muted wordmark/promise text uses `--bs-color-brand-context-on-surface-muted` (76% white), also comfortably passing, confirmed by the axe-core color-contrast rule reporting zero violations rather than by eye alone.

## Lighthouse (real runs against the production build, `.output/server/index.mjs`, via `npx lighthouse` + the environment's pinned Chromium)

| Category | Mobile (simulated throttling) | Desktop |
|---|---:|---:|
| Performance | **81** | **99** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

Accessibility/Best Practices/SEO hit the 95+ target on both profiles; desktop Performance clears the 90+ aim comfortably (LCP 0.8s, TBT 20ms, CLS 0). Mobile Performance does not clear 90 — see Remaining Issues for the honest breakdown of what's left and why.

Measured, not assumed: the first mobile run scored 77 (LCP 4.2s); investigating `network-requests` showed `favicon.png` alone was 129KB and both OG images were ~220KB each, all uncompressed Playwright screenshots. Re-encoding them with palette-quantized PNG compression (`scripts/generate-og-assets.mjs`, visually verified for banding before committing to the change) took the favicon to 35KB and the OG images to ~47KB each, moving mobile Performance to 81.

## Responsive QA (task §22/§32) — automated, `tests/e2e/no-scroll.spec.ts`

Every viewport below was checked for `document.documentElement.scrollHeight <= clientHeight` and `scrollWidth <= clientWidth` (2px rounding tolerance) in **both** English/LTR and Arabic/RTL — 24 checks, all passing — plus a dedicated reduced-motion pass at 390×844 and 1440×900.

| Viewport | Vertical scroll | Horizontal scroll | Clipping |
|---|---|---|---|
| 320×568 | none | none | none |
| 360×640 | none | none | none |
| 375×667 | none | none | none |
| 390×844 | none | none | none |
| 412×915 | none | none | none |
| 768×1024 | none | none | none |
| 1024×768 | none | none | none |
| 1280×720 | none | none | none |
| 1366×768 | none | none | none |
| 1440×900 | none | none | none |
| 1536×864 | none | none | none |
| 1920×1080 | none | none | none |
| 2560×1440 | none | none | none |

At every size the logo stays intact and legible, "Coming Soon" stays dominant (wrapping to two lines below ~430px width is treated as intentional — a 2-word display headline at this font scale, not a bug — see `test-results/visual-evidence/mobile-*.png`), and the platforms rail stays fully inside the viewport without crowding the brand cluster. Adding the rail meant lowering the logo and headline ceilings (168px → 140px, 6.5rem → 5rem); an oversized headline was the previous composition's answer to an empty lower half that no longer exists.

## Fixed during this pass

- **The gold hairline was laid out, opacity 1, and completely invisible.** It shipped as a static in-flow child of `.bs-experience`, and `ArchitecturalAtmosphere` is an absolutely-positioned sibling, so the divider painted underneath it. Every other foreground child already carried `position: relative; z-index: 1`; the divider did not. Caught by reading a cropped screenshot at full resolution, *not* by the test suite — the reduced-motion opacity assertions passed the whole time. `tests/e2e/landing.spec.ts` now asserts stacking directly for all three foreground elements.

## Unresolved issues

- **Mobile Lighthouse Performance is 81, not the aimed-for 90+.** After fixing the favicon/OG-image cost (see above), the remaining budget is the JS framework baseline: Vue + Nuxt runtime + `motion-v` + `@hugeicons/vue`, all task-mandated dependencies. Notably, `AppearanceControl`/`LanguageControl`/Hugeicons are currently *not rendered anywhere* on this page (no visible chrome, per task §26) but are still shipped in the client bundle because the task explicitly asks for that infrastructure to be preserved and working for future use, not deleted. That preservation has a real, measured bundle-size cost; trimming it further would mean walking back an explicit requirement, so it's recorded here rather than silently traded off.
- **The Arabic OG image's Arabic text renders in headless Chromium's default font fallback, not the bundled IBM Plex Sans Arabic**, since it's composed once via a standalone script, separate from the live page's own font loading. Cosmetically fine (correct RTL, fully legible) but not pixel-identical to in-app Arabic typography. Low priority — OG images only surface in link-preview contexts.
- **No dedicated app-icon-mark asset exists in the source repository** (`assets/logos/` only has the two full-height logo PNGs; `05_APP_ICON_GUIDE.md` describes a simplified companion mark that is explicitly still outstanding upstream). The favicon therefore places the unmodified full logo, aspect-locked, on a Building Navy square tile rather than using a true simplified app-icon mark. Acceptable, not ideal — revisit if that asset is produced upstream.
- **No formal accessibility conformance claim.** Consistent with the source repository's own posture (Discrepancy Log D-06): strong automated evidence (axe-core, 0 violations across English and Arabic) is reported, not a certified WCAG conformance statement.
