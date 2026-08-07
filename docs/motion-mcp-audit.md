# Motion MCP Audit

## Preflight: is a real Motion.dev MCP available?

No. This session has an MCP server literally named `motion` connected, and it was re-inspected from scratch for this task (not assumed from a prior session). Its full tool surface: `create_video`, `create_followup`, `get_session_status`, `get_credit_balance`, `get_settings`, `list_api_keys`, `create_api_key`, `revoke_api_key`, `list_plans`, `purchase_credits`, `subscribe_to_plan`, `show_plans_and_credits`, `upload_asset`, `register_service_account`, `whoami`. That is **Motion, the AI video-generation product** — "create and edit videos... launch videos, article-to-video, explainers." Calling `whoami` returns definitive proof this is a different product entirely:

```json
{ "iss": "https://mcp.motion.so", "aud": "https://mcp.motion.so/mcp", "email": "tarekian99@gmail.com" }
```

`mcp.motion.so` is Motion (motion.so), the video tool — not `motion.dev`, the animation-library documentation site this task's Motion.dev MCP references. There is no documentation search, no Vue/Nuxt example search, no transition editor, no spring generator, and no MotionScore tool anywhere in this server's surface. No project-level Motion AI Kit installer was run either, since that step only applies once a real Motion.dev MCP/Kit is confirmed absent from the *project* — moot here, as no such server exists in this *session* at all. No private API keys were requested, created, or exposed during this check.

Per the task's own instruction ("state that explicitly... never fabricate a result"), no Motion.dev MCP queries, documentation excerpts, or MotionScore output are fabricated anywhere in this report or in the codebase's comments.

## Fallback method actually used

Motion behavior was implemented from two verifiable, non-fabricated sources:

1. **`.docs/03B.BUILDING_SUIT_MOTION_SPEC.md`** (`business-strengthening-checkpoint-07`) — the product's own motion contract: duration scale, easing curves, distance/stagger limits, reduced-motion table. This is also exactly the contract the task brief's own §16 example reproduces, so the two agree by construction.
2. **Direct inspection of the installed `motion-v@2.3.0` package's TypeScript declaration files** (`node_modules/motion-v/dist/**/*.d.ts`), read before writing any component code: `dist/nuxt/index.d.mts` (confirms the Nuxt module auto-registers `Motion`, `MotionConfig`, and utilities globally with an empty prefix by default), `dist/es/components/motion/{props,types}.d.ts` (confirms `<Motion as="...">`, `initial`/`animate`/`whileHover`/`whilePress`, and that `:style="{ x, y }"` is how motion values drive transform), `dist/es/components/motion-config/types.d.ts` (`reducedMotion: 'user' | 'never' | 'always'`), `dist/es/animation/hooks/use-reduced-motion.{d.ts,mjs}` (confirms it wraps `@vueuse/core`'s `useMediaQuery`, resolved via a plain `computed()` — the detail that explains the hydration bug below), `dist/es/value/{use-scroll,use-transform,use-spring}.d.ts` (`useMotionValue`, `useSpring`, `useTransform` signatures used for the pointer parallax).

Mapped against the task's own suggested search topics (no MCP was queried for these — this is what was actually consulted in its place):

| Suggested search intent | What was actually consulted | Where it landed |
|---|---|---|
| `MotionConfig` with reduced-motion preference | `motion-config/types.d.ts` | `app/app.vue` — `<MotionConfig reduced-motion="user">` wraps the page |
| Vue/Nuxt hero entrance using variants or a scoped timeline | `components/motion/props.d.ts` (`initial`/`animate`/`transition`) | `app/utils/buildingSuitMotion.ts` — `environmentReveal`/`logoReveal`/`textReveal`, consumed by `ArchitecturalAtmosphere.vue` and `BrandIdentity.vue` |
| Motion Vue pointer-based parallax | `value/use-spring.d.ts`, `value/use-transform.d.ts`, `value/use-motion-value*` | `ArchitecturalAtmosphere.vue` — spring-smoothed pointer parallax on the structural planes and gold glow only |
| `useTransform` / `useMotionValue` / spring interaction | Same files as above | Same component |
| Motion Vue reduced motion / accessibility reduced motion | `use-reduced-motion.{d.ts,mjs}` | `app/composables/useSafeReducedMotion.ts` (see bug below), consumed everywhere motion is conditional |
| SSR-safe Motion for Vue usage | Manual SSR + hydration testing against the built output (not a doc search) | Found and fixed the hydration-mismatch bug below |
| Motion performance transform opacity | Motion Spec §9 directly + manual audit of every component's animated CSS properties | See Performance section below |
| Motion UI premium hero section | Task brief's own §13/§14 art-direction description, translated into Building Suit tokens (not a Motion UI component search — that would have meant copying visual composition from an unrelated brand, which the task explicitly forbids) | `ArchitecturalAtmosphere.vue`, `BrandIdentity.vue` |

## Two real bugs this process caught (not hypothetical — both reproduced and fixed)

**1. Transform ownership conflict (pointer parallax).** `<Motion :style="{ x, y }">` takes full ownership of the `transform` CSS property on whatever element it's bound to; a static `transform` authored in that same element's stylesheet rule (used for centering via `translate(-50%,-50%)`, or for the grid layers' `perspective()/rotateX()/scale()`) is silently dropped, not merged. First build: the gold glow rendered anchored at its un-translated top-left position instead of centered, and the perspective grid tilt never applied. Root cause confirmed by reading the rendered `getComputedStyle(...).transform` — it showed `none` on the parallax-bound element despite an authored CSS rule. Fix: split every parallaxed layer into a static outer wrapper (owns position + any static `transform`) and an inner `<Motion>` element that receives only the `x`/`y` motion values (`ArchitecturalAtmosphere.vue`).

**2. RTL logical-property vs. physical-transform mismatch.** The glow-wrapper's centering originally used `inset-inline-start: 50%` (a logical property, becomes `right: 50%` under `dir="rtl"`) combined with a fixed `transform: translate(-50%, -50%)` (always physical — CSS transforms are not direction-aware). Anchoring via the *right* edge while translating in the same fixed negative direction as a *left* anchor breaks the centering math specifically under RTL — confirmed by measuring the rendered bounding box (`left`/`right` computed styles vs. actual `getBoundingClientRect()`), which showed the glow centered ~270px off-axis in Arabic only. Per the task's own rule ("purely physical/architectural geometry does not have to mirror"), the fix was to switch the entire decorative atmosphere layer (grid wrappers, structural planes, glow) to physical `left`/`right`/`top`/`bottom` — correct both technically and semantically, since none of that layer is reading-direction content.

**3. SSR hydration mismatch under reduced motion.** `useReducedMotion()`'s underlying `useMediaQuery` can resolve synchronously on the client during `setup()`, before Vue's hydration pass runs. Components that branched their `initial`/`animate` props directly on that value produced a client-side hydration render that disagreed with the server-rendered markup (which has no way to know the OS preference at all), logging `Hydration completed but contains mismatches.` — caught by inspecting `page.on("console")` output against the built app under `page.emulateMedia({ reducedMotion: "reduce" })`, not assumed. Fix: `app/composables/useSafeReducedMotion.ts` always starts at `false` (matching SSR) and only adopts the real value inside `onMounted`, which Vue guarantees runs after hydration completes.

## Motion APIs used in the final implementation

- `MotionConfig` (`reduced-motion="user"`) — global config, `app/app.vue`.
- `Motion` component (`as="..."`, `initial`/`animate`/`transition`) — environment fade, logo, wordmark, status, promise (`ArchitecturalAtmosphere.vue`, `BrandIdentity.vue`).
- `useReducedMotion()` — wrapped by `useSafeReducedMotion()` everywhere it's consumed (see bug #3).
- `useMotionValue()`, `useSpring()`, `useTransform()` — the pointer-parallax chain in `ArchitecturalAtmosphere.vue`.
- `motion-v/nuxt` module — global component/composable auto-import, `nuxt.config.ts`.

Not used: `useInView()` / `whileInView` — the earlier multi-section page used it for below-the-fold viewport reveal, but this page has no fold at all (single viewport, task §10/§32), so there is nothing to reveal on scroll. Its earlier reduced-motion failure mode (documented in this file's git history) is structurally impossible in the current design.

## Entrance sequence (task §17)

| Phase | Element(s) | Motion | Duration/easing |
|---|---|---|---|
| 1 — environment | `ArchitecturalAtmosphere` (background field + grid + planes + glow, one group) | Opacity fade only, no travel | `emphasized` (320ms) / `enter` |
| 2 — logo | Logo image | Opacity + 14px vertical settle, no scale, no bounce | `standard` (240ms) / `enter` |
| 3 — brand text | Wordmark → status → promise | Opacity + 8px settle, 20ms stagger step, ≤80ms accumulated (Motion Spec §3.4) | `standard` / `enter` |
| 4 — ambient | Nothing further animates on a timer. Only the optional pointer parallax remains, and only in response to real pointer movement. | — | — |

No infinite/looping animation exists anywhere in the codebase (verified by reading every component — the only unbounded thing is a passive `pointermove` listener, not an animation loop).

## Interactive motion (task §18)

Pointer parallax is attached only when `window.matchMedia('(pointer: fine)').matches` is true and `useSafeReducedMotion()` is false, checked once in `onMounted`. Two spring-smoothed motion values (`stiffness: 40, damping: 18, mass: 0.6`) drive an 8px-max offset split across the structural planes (larger share) and the gold glow (smaller, opposite-direction share), so the scene reads as "the room responding," not a cursor-follow effect. The logo, all text, and the future-actions slot never receive any parallax binding — confirmed by grep (`x:` / `y:` style bindings only appear on `.bs-atmosphere__*` elements). Touch/coarse-pointer devices never attach the listener at all (checked once, not per-event).

## Reduced motion (task §20) — Playwright-verified, not asserted

`tests/e2e/landing.spec.ts` → "every entrance element is immediately visible under prefers-reduced-motion: reduce" asserts `opacity: 1` (computed, not authored) on the atmosphere, logo frame, wordmark, status, and promise with **no scroll and no wait beyond initial load**. A second test confirms the pointer-parallax transform does not change at all when the (reduced-motion) page receives pointer movement, i.e. the parallax listener genuinely never attached. `tests/e2e/no-scroll.spec.ts` additionally re-runs the full no-scroll matrix under reduced motion at one mobile and one desktop size.

## Performance (task §21) — manual audit, since MotionScore is unavailable

- Every animated property in every component is `opacity` or `transform` (translate via Motion's `x`/`y`, or a static/one-time CSS `transform` for centering/perspective that never animates). Confirmed by reading each `<style>` block; no animated `filter`, `blur`, `box-shadow`, `width`, `height`, `top`, or `left` anywhere.
- No `transition: all` anywhere (`grep -rn "transition: all" app/` returns nothing).
- No canvas, no WebGL, no `requestAnimationFrame` loop — the only continuous listener is the passive `pointermove` handler, and Motion's own spring integration (not hand-rolled rAF) drives the resulting motion values.
- Real Lighthouse measurement, not a claim: see `docs/visual-qa.md` for the actual scores (desktop Performance 99, mobile 81 — the mobile number moved from an initial 77 after investigating and fixing a genuine, measured cost: the favicon and OG images were uncompressed Playwright screenshots at 129-224KB each; palette-quantized re-encoding brought them to 35-48KB with no visible quality loss — not just re-running the audit hoping for a better number).

## MotionScore

Not available in this environment — no MotionScore tool exists among the connected MCP servers, and no `motionscore` CLI resolves via `npm`. Stated here explicitly per the task's instruction, rather than fabricated. The Performance section above is the documented manual substitute.
