# Building Suit — Source Ref Audit

## Repositories

| Role | Path (this session) | Remote |
|---|---|---|
| Source design repository (read-only) | `/home/user/building-suit` | `https://github.com/tareq-abdelwhap/building-suit` |
| Target website repository | `/workspace/building-suit-website` | `https://github.com/tareq-abdelwhap/building-suit-website` |

**Audit date/time:** 2026-08-06T21:56:27Z (UTC)

No file inside `/home/user/building-suit` was modified, staged, or committed during this task. All source content was read with `git show <ref>:<path>` against the fetched remote refs below; the working tree was never checked out to a different branch.

## Inspected refs

`git fetch --all --prune` was run against `origin` before inspection. Exact commit SHAs at audit time:

| Ref | Commit SHA | Last commit date | Last commit subject |
|---|---|---|---|
| `origin/main` | `123166fe0eb57be31befe1543d2e356ea8247c8d` | 2026-08-07 00:34:23 +03:00 | Updated .gitignore |
| `origin/codex/remove-prototype` | `d746c578539017caa046a6a34a7f1f949df4356a` | 2026-07-30 14:26:53 +03:00 | chore(agent): add local skill bundle |
| `origin/codex/design-system-correction` | `51f6513e366b284af2770d25e090ea2928412edb` | 2026-07-30 11:24:45 +03:00 | docs(design): record palette correction |
| `origin/codex/business-strengthening-checkpoint-07` | `ff4877bb651df2eab03643498f14f97da7c68c40` | 2026-07-31 12:20:21 +03:00 | docs: align checkpoint 07 residual terminal summaries |
| `origin/dev` | `65b5e2f136ab3c7440d82e276f7d79344b7e94d2` | 2026-06-24 12:50:04 +03:00 | Merge pull request #1 (pricing journeys business review) |

Branch lineage findings:

- `origin/main` does **not** contain `codex/remove-prototype`, `codex/design-system-correction`, or `codex/business-strengthening-checkpoint-07` as ancestors. `main` still has the retired `prototype/` directory and an uncorrected `design-tokens.json` (content hash differs from the corrected version). **`main` was not used as a source for this task.**
- `origin/codex/design-system-correction` **is** an ancestor of `origin/codex/remove-prototype` (remove-prototype builds on the correction and additionally deletes `prototype/`). No `prototype/` directory exists on `remove-prototype`.
- `origin/codex/business-strengthening-checkpoint-07` is **not** a descendant of `remove-prototype` or `design-system-correction` — it diverges from a common ancestor (`9552328b233b0dffe4396269ac0a3c36d48659fe`, the `design-system-correction` commit itself). checkpoint-07 still carries the old `prototype/` directory and an uncorrected token file; it was **not** used as a design-system source.
- `origin/codex/business-strengthening-checkpoint-01` through `-06` form a linear ancestor chain into `-07` (01 is an ancestor of 07); `-07` is the latest checkpoint in that chain and was inspected as instructed.
- `checkpoint-07`'s `.docs/01.BUILDING_SUIT_PRD.md` and `.docs/03. BUILDING_SUIT_UX_SPEC.md` differ in content from the versions on `main`/`remove-prototype` (different SHA-256), confirming it carries newer, independent product-document edits ("business strengthening") not present on the design-correction line.
- No branch later than these four was found in `origin` at fetch time that clearly supersedes them.

## Authority resolution actually applied

Because the corrected design-system material and the latest product-document edits live on two branches that diverge from a common ancestor and were never merged, this task read **product truth from one ref and design-system truth from another**, per the task's own authority-order instructions (product docs vs. presentation docs are independently ranked):

| Domain | Ref used | Why |
|---|---|---|
| Product behavior/scope (PRD, BRD, UX spec, architecture, database, security matrix) | `origin/codex/business-strengthening-checkpoint-07` | Latest applicable/approved checkpoint on the product track; UX/PRD content here postdates and supersedes the copies on `main`/`remove-prototype`. |
| Design-system presentation (tokens, color/typography/visual-language/UI-system docs, logo assets, website hero guide) | `origin/codex/remove-prototype` | Explicitly named in the task as the corrected 2026-07-30 design-system material; carries the `design-system-correction` ancestor and the retired-prototype removal. `checkpoint-07`'s copies of these files are the pre-correction versions and were not used. |
| Motion structural-page authority | `.docs/03B.BUILDING_SUIT_MOTION_SPEC.md` read from `checkpoint-07` (product track, since motion spec ships alongside UX spec) | See contradiction #2 below. |

## Public claims accepted / excluded

**Accepted territory** (confirmed consistent with `01_BRAND_FOUNDATION.md`, `02_BRAND_POSITIONING.md` on `remove-prototype`, and PRD/BRD scope on `checkpoint-07`): mobile-first operational control for self-managed residential buildings; units/residents; finances (charges, payments, expenses, balances, auditable ledger); issues; announcements; shared/unit-based governance and voting; administrator continuity/handover; bilingual Arabic/English.

**Excluded** (per task's explicit prohibited-claims list, cross-checked against brand docs which independently confirm Shop/Business/City Suit are described only as "future ecosystem" and provider directory / online payment as "manual-first, gateway-ready" i.e. not live): live Service Provider Directory, Shop/Business/City Suit availability, completed Super-Admin, live Paymob/online payment, published launch date, customer/usage numbers, testimonials, awards, app-store availability, AI-powered claims, superlative hype language ("revolutionary," "world-class," etc. — also directly prohibited by `01_BRAND_VOICE.md`'s own vocabulary rules).

## Contradictions found and resolutions applied

1. **Branch divergence (product vs. design-system tracks).** See authority-resolution table above. Resolution: split by domain as shown; recorded here rather than silently merging the two lines.

2. **Motion duration/easing: DTCG tokens vs. complete Motion Spec.** `design-tokens.json` → `motion.*` defines only three named transitions (`quick` 120ms, `default` 180ms, `enter` 200ms, single `standard` easing curve). `.docs/03B.BUILDING_SUIT_MOTION_SPEC.md` §3.1–3.2 defines a fuller six-step duration scale (`instant/micro/quick/standard/emphasized/extended` = 0/120/180/240/320/420ms) and four easing curves (`enter/exit/standard/linear`). Per the task's explicit instruction, **the complete Motion Spec governs structural page motion**; the DTCG `motion.*` transition tokens are treated as component-level shorthand only, not a ceiling on page-level entrance/reveal timing. `app/utils/buildingSuitMotion.ts` implements the Motion Spec scale (which is also exactly what the task's own §13 example contract specifies — the two are identical).

3. **No other content contradiction found.** The English/Arabic copy supplied in the task was checked against `01_BRAND_VOICE.md` vocabulary rules, `01_BRAND_FOUNDATION.md` scope language, and PRD/BRD scope on `checkpoint-07`; no phrase required correction.

## Files read (for the record)

Design-system (`remove-prototype`): `07-design-tokens/design-tokens.json`, `07-design-tokens/colors.css`, `03-visual-identity/{01_COLOR_SYSTEM,02_TYPOGRAPHY_SYSTEM,03_VISUAL_LANGUAGE,04_LAYOUT_AND_SPACING,05_ICONOGRAPHY_STYLE,06_IMAGERY_STYLE}.md`, `04-ui-system/{01_UI_STYLE_GUIDE,02_COMPONENT_STYLE_GUIDE,03_DARK_MODE_GUIDE,04_LIGHT_MODE_GUIDE}.md`, `05-marketing/02_WEBSITE_HERO_GUIDE.md`, `02-logo-system/{02_LOGO_USAGE_RULES,03_LOGO_CLEAR_SPACE,04_LOGO_DOS_AND_DONTS}.md`, `01-strategy/{01_BRAND_FOUNDATION,02_BRAND_POSITIONING,03_BRAND_VOICE,04_TARGET_AUDIENCE}.md`, `09-design-control/{00_START_HERE,01_DESIGN_SYSTEM_MANIFEST,04_DISCREPANCY_LOG}.md`, `README.md`, `assets/logos/{building-suit-logo-dark.png,building-suit-logo-light.png,logo-source-notes.md}`, root `CLAUDE.md`.

Product (`checkpoint-07`): `01.BUILDING_SUIT_PRD.md`, `02.BUILDING_SUIT_BRD.md`, `03. BUILDING_SUIT_UX_SPEC.md`, `03A.BUILDING_SUIT_UI_SPEC.md`, `03B.BUILDING_SUIT_MOTION_SPEC.md`, `04.BUILDING_SUIT_SYSTEM_ARCHITECTURE.md`, `05.BUILDING_SUIT_DATABASE_DESIGN.md`, `07.BUILDING_SUIT_SECURITY_MATRIX.md`, `12.BUILDING_SUIT_BUSINESS_ANALYSIS.md` (architecture/database/security read only to check the public copy doesn't contradict locked constraints — not used as visual/design sources).

## Logo asset provenance

Copied from `origin/codex/remove-prototype` at `.docs/building-suit-brand-guidelines/assets/logos/`:

| File | Git blob SHA | File SHA-256 |
|---|---|---|
| `building-suit-logo-dark.png` | `be54d13ab1a43f756530186fbb6ee14cf4bde7bb` | `bd38b426f1964ad031a232a8b7f89095223dea5760f1a31234a38f17d2cc472f` |
| `building-suit-logo-light.png` | `b11a12bff243beccdf44fc4387f4f2d9265d8755` | `f6c0a0aa2bfad96415f9f9e024ac05a536adde8e1d8f4897890d35392a3fb510` |

Both are 920×1245 PNG, RGBA, byte-identical to the source repository (verified by git blob SHA match). See `design-system.lock.json` for the machine-readable record.

## Note on the target repository itself

`tareq-abdelwhap/building-suit-website` was created empty specifically for this task after two earlier attempts were blocked by GitHub App permissions (no repo-creation rights in the `Building-Suit` org, then none on the personal account either). The user created the repo manually; this session attached it read/write and cloned it. No relationship to `tareq-abdelwhap/building-suit-old` or any other existing repository.
