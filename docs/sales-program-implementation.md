# Sales program implementation — 2026-10-09

The user requested `/sales-program`, complete admin control over its wording with rich formatting, a visible homepage CTA and seven configurable social platforms. The attached handoff contains both public copy and implementation instructions. Public copy is preserved; its restrictions on homepage/admin edits do not override the user's direct request.

## Content and controls

- `app/data/sales-program.json` contains the public Arabic copy from section 6 of the source. Every public paragraph and all 12 FAQ questions/answers are checked against `docs/sales-program-source.md`, an unchanged copy of the attachment.
- Editorial directions, internal repository notes, campaign appendices and operational Messenger setup instructions are not visitor copy.
- The optional reference pricing table is omitted because it is not verified as the active commercial catalog. The supplied pricing explanation and 8,000 EGP examples are included verbatim, following the attachment's alternative for unconfirmed prices.
- `/admin` → **Sales program & social media** edits the full page document, headings, text, CTA labels/destinations, return link label, skip link, logo accessible name and SEO metadata. No visible sales-page wording is locked in the page template.
- Formatting supports bold, italic, underline, strikethrough, lists, headings, paragraphs, alignment, links, undo/redo and supported Word HTML paste formatting. This is a browser rich-text editor, not a full Word document engine. Unsupported/executable HTML is stripped both when editing and when publishing.
- The homepage CTA defaults to **Join us** and remains editable. It sits in the top corner without adding height to the original homepage layout. Social logos appear in normal flow below project links only when their URL is configured.
- Supported platforms: LinkedIn, Instagram, Facebook, Messenger, TikTok, X and WhatsApp. Blank/invalid links are hidden, invalid admin input is rejected, and external links use safe protocols and opener protection.
- `app/app.vue` sets Arabic/RTL specifically on `/sales-program`; homepage locale and admin access rules are retained.

## Database activation

Apply `supabase/migrations/20261009193638_sales_program_content.sql` to the website's Supabase project before using the new save controls. It adds nullable `sales_program` JSONB and `social_links` JSONB to the existing singleton `site_settings` row; existing public-read/admin-write RLS policies remain the authorization boundary. Until first admin save, the page uses bundled copy and socials default to empty. A missing migration produces an explicit save error, not a false success.

The migration has **not been applied to the configured/remote project**. No production data, auth rules, environment variables or secrets were changed. Deployment and remote migration application are separate from submitting these source changes for review.

## Verified links

Read-only HTTPS checks on 2026-10-09 returned HTTP 200 and the expected HTML title/H1:

- https://shop.building-suit.com/terms — Terms & Conditions · Shop Suit
- https://shop.building-suit.com/privacy — Privacy Policy · Shop Suit
- https://shop.building-suit.com/refund-cancellation — Refund & Cancellation Policy · Shop Suit

Initial web-tool fetching failed, so the final verification used direct HTTP requests. These checks verify route destinations, not legal/commercial approval of the program.

## Verification

- `pnpm typecheck`: passed.
- `pnpm lint`: passed. Generated browser report assets are ignored by ESLint.
- `pnpm test`: 26 tests passed, including source-copy equality, formatting safety, Word styles and URL validation.
- `pnpm build`: passed.
- `node scripts/verify-sales-program.mjs`: passed with a local API fixture and real Chromium. Covers public RTL routing/12 FAQs, 1440/390/320px layouts, axe WCAG 2 A/AA, anonymous admin denial, authenticated editor underline, failed-save handling, save/reload, modified CTA and conditional/all-seven social logos. This does not assert production database activation.
- Disposable PostgreSQL 17: migration succeeded; public read, non-admin write denial, admin update and public read of saved JSON all passed. The disposable container was removed afterward.
- Existing homepage no-scroll suite initially passed 23/28 against the configured live three-project content. After removing the added CTA's layout height, the six shortest-viewport tests were rerun: 375×667 EN/AR pass; 320×568 and 360×640 EN/AR still fail due to pre-existing project-content height. At 320×568, both the final page and the original composition with added links removed measure 683px. No new horizontal overflow was found. The suite assumes the original one-project state; the local fixture checks that state fits.
- Rendered evidence under `test-results/sales-program/`: sales page, admin editor, homepage/socials at desktop and mobile sizes. Header logo size and CTA placement were corrected after screenshot review. Only the site's supported fixed dark treatment is relevant; sales content is Arabic/RTL, admin English/LTR, homepage remains bilingual.

Reproduce browser checks after building with `node scripts/verify-sales-program.mjs`. For the existing Playwright suite on this host, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`; otherwise the config uses Playwright's installed browser.
