# Motion MCP Audit

## Preflight: is a real Motion.dev MCP available?

This session has an MCP server literally named `motion` connected. On inspection, its tool surface is `create_video`, `create_followup`, `get_credit_balance`, `get_session_status`, `list_plans`, `purchase_credits`, `register_service_account`, `setup_payment_method`, `subscribe_to_plan`, `upload_asset`, `whoami` — that is **Motion, the AI video-generation product** ("create and edit videos... launch videos, article-to-video, explainers"). It is unrelated to **Motion.dev**, the `motion`/`motion-v` animation library whose Vue/Nuxt documentation and examples this task asks to be queried. This is a name collision between two different products called "Motion," not a Motion.dev MCP server under a different name — none of its tools expose documentation search, Vue examples, performance guidance, or a MotionScore audit.

Per the task's own instruction ("If the environment cannot activate the MCP server in the current session, report the exact missing prerequisite instead of pretending the MCP was used"), no Motion.dev MCP queries were fabricated. No project-level Motion AI Kit installer was run either (section 12 step 2 only applies once a real Motion.dev MCP/Kit is confirmed absent from the *project*, which was moot here since no such server exists in this *session* at all). No private API keys were requested or exposed.

## Fallback method actually used

Motion behavior was implemented from two verifiable, non-fabricated sources instead:

1. **`.docs/03B.BUILDING_SUIT_MOTION_SPEC.md`** (read from `checkpoint-07`, see `docs/building-suit-source-audit.md`) — the authoritative, product-specific motion contract: duration scale, easing curves, distance/stagger limits, viewport-reveal rules, reduced-motion table.
2. **Direct inspection of the installed `motion-v@2.3.0` package's TypeScript declaration files** (`node_modules/motion-v/dist/**/*.d.ts`) — read line-by-line to confirm the real, current API surface before writing any component code, rather than recalling the API from training data. Specifically inspected: `dist/nuxt/index.d.mts` (Nuxt module — confirms global component/utility auto-registration and default `prefix: ""`), `dist/es/components/motion/{props,types}.d.ts` (confirms `<Motion as="div">`, `whileHover`/`whilePress`/`whileInView`/`inViewOptions` prop names), `dist/es/components/motion-config/types.d.ts` (confirms `MotionConfig`'s `reducedMotion: 'user' | 'never' | 'always'` prop), `dist/es/animation/hooks/use-reduced-motion.d.ts` and `.mjs` (confirms `useReducedMotion()` wraps `useMediaQuery('(prefers-reduced-motion: reduce)')` from `@vueuse/core`, and — critically — that it resolves via `computed()`, not a lifecycle hook, which is what surfaced the reduced-motion bug described below), `dist/es/value/{use-scroll,use-transform}.d.ts` (confirms `useScroll({ target })` returns `scrollYProgress` etc., and `useTransform(value, inputRange, outputRange)`).

This matches the task's own listed "example intent" search topics even though no MCP was queried — mapped here for traceability:

| Task's suggested search intent | What was actually consulted | Where it landed |
|---|---|---|
| `MotionConfig` with reduced-motion preference | `motion-config/types.d.ts`, `MotionConfig.d.ts` | `app/app.vue` — `<MotionConfig reduced-motion="user">` wraps the whole page |
| Vue/Nuxt hero entrance using variants or a scoped timeline | `components/motion/props.d.ts` (`initial`/`animate`/`transition`) | `app/components/landing/ComingSoonHero.vue`, `TrustDescriptors.vue` |
| One-time viewport reveal | `value/use-scroll.d.ts`... superseded by `utils/use-in-view.d.ts` after the bug below | `app/components/landing/ValuePillars.vue`, `ComingSoonClosing.vue` |
| `useScroll` and `useTransform` | `value/use-scroll.d.ts`, `value/use-transform.d.ts` | `app/components/landing/ArchitecturalSignal.vue` (decorative parallax) |
| Low-amplitude decorative parallax | Motion Spec §5.4 (2–6% of viewport) | Same file — capped at 18px total travel |
| Sticky-header state transitions | Motion Spec §9 (performance contract: transform/opacity only, no layout reflow) | `app/components/landing/LandingHeader.vue` — background/border/logo-opacity crossfade only |
| SSR-safe Motion for Vue usage | `nuxt/index.d.mts`, plus manual SSR/hydration testing (see bug below) | `app/plugins/hugeicons.ts` pattern reused for global registration; SSR hydration verified via `curl` + Playwright against the built output |
| Motion performance guidance | Motion Spec §9 directly | `buildingSuitMotion.ts` values; no blur/shadow/filter animation anywhere in the codebase |
| MotionScore source and runtime audits | Not available in this environment (see below) | Manual audit performed instead |

## A real bug this process caught

While verifying reduced-motion behavior against a running build (not assumed), the below-the-fold sections (`ValuePillars`, `ComingSoonClosing`) stayed at `opacity: 0` under `prefers-reduced-motion: reduce` even with no scrolling — violating the Motion Spec §8 requirement that viewport reveal "appears immediately" under reduced motion. Root cause: `<Motion :while-in-view>`'s `initial` prop is evaluated once at mount (matching upstream Framer Motion's contract), and because reduced-motion detection resolves client-side after SSR's unavoidable `false` default, the component had already committed to intersection-gated behavior by the time the corrected value arrived — a later prop swap didn't retroactively change it.

Fix: replaced `:while-in-view`/`:in-view-options` with a manually-owned `useInView()` ref combined with `useReducedMotion()`, driving a reactive `:animate` prop instead (`animate`, unlike `initial`, *is* reactive post-mount in this library). See `app/utils/buildingSuitMotion.ts` → `revealItemMotion()` and its inline comment. Caught by a Playwright test added specifically for this (`tests/e2e/landing.spec.ts` → "below-the-fold viewport-reveal content ... is visible without scrolling"), which now passes.

## Motion APIs used in the final implementation

- `MotionConfig` (`reduced-motion="user"`) — global config, `app/app.vue`.
- `Motion` component (`as="..."`, `initial`/`animate`/`whileHover`/`whilePress`/`transition`) — hero, trust descriptors, CTA, header logo crossfade (via plain CSS transition, not Motion, since it's a background/opacity swap keyed off scroll state, not an animation prop).
- `useReducedMotion()` — `ValuePillars.vue`, `ComingSoonClosing.vue`, `ArchitecturalSignal.vue`.
- `useInView()` — `ValuePillars.vue`, `ComingSoonClosing.vue` (see bug above).
- `useScroll()` + `useTransform()` — `ArchitecturalSignal.vue`, decorative parallax only (never text, buttons, or controls).
- `motion-v/nuxt` module — global component/composable auto-import, `nuxt.config.ts`.

## Reduced-motion mapping (implemented, Playwright-verified)

| Motion type | Spec requirement | Implementation |
|---|---|---|
| Hero entrance | Not explicitly reduced-motion-gated in the spec's table, but `MotionConfig reducedMotion="user"` collapses all `initial/animate` transitions to their end state automatically for user-preference reduced motion | Verified: `.bs-hero__headline` opacity is `1` immediately, no travel, under `prefers-reduced-motion: reduce` |
| Viewport reveal (pillars, closing) | "Content appears immediately" | Fixed as described above; Playwright-verified with no scroll |
| Parallax (`ArchitecturalSignal`) | "Disabled" | `:style="{ y: reducedMotion ? 0 : layerY }"` — explicit zero, not just a shorter transition |
| Header surface transition | Should still work, is a `quick` opacity/background crossfade, not structural travel | Unaffected by reduced motion by design (no y/scale travel) |

## Performance findings (manual audit)

- Every animated property across the codebase is `opacity`, `transform` (translate/scale), or a plain CSS `background-color`/`border-color` transition — no animated `blur`, `box-shadow`, `filter`, or layout-triggering property (`width`/`height`/`top`/`left`) anywhere.
- No `transition: all` anywhere (checked via `grep -rn "transition: all" app/`).
- Stagger is capped at `stagger.maxItems * stagger.stepSeconds` (80ms) per `buildingSuitMotion.ts`, matching Motion Spec §3.4, and unit-tested (`tests/buildingSuitMotion.spec.ts`).
- Parallax travel is capped at 18px total (`parallaxRangePx`), well inside the Spec §5.4 2–6%-of-viewport guidance for a ~420px-tall panel.
- No `requestAnimationFrame` loop, no canvas, no WebGL, no continuous/infinite animation of any kind (confirmed by reading every component file — the only unbounded state is the header's scroll listener, which is a passive event listener, not an animation loop).
- `useInView({ once: true })` unsubscribes its observer after first trigger (library-internal behavior, not reimplemented here).

## MotionScore

No MotionScore tool or account capability was available in this environment (it is not one of the connected MCP servers, and no CLI named `motionscore` or equivalent resolved via `npm`). Per the task's fallback instruction, this is stated explicitly rather than fabricated, and the manual audit above stands in its place.
