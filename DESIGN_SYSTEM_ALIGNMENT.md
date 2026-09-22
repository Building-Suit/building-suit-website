# Building Suit Design System Alignment

This standalone website follows the maintained Building Suit monorepo guidance reviewed before implementation:

- Shared neutral application surfaces: ink/charcoal/graphite in dark mode.
- Building Navy and Premium Gold remain brand/action colors.
- Manrope for Latin and IBM Plex Sans Arabic for Arabic.
- PrimeVue is configured unstyled so the Building Suit tokens own presentation.
- Tailwind CSS 4 is installed through the Vite integration approved by the monorepo Nuxt layer.
- Supabase receives only browser-safe Project URL and publishable/anon key in frontend configuration.
- Auth and write authorization are enforced with RLS rather than hidden UI controls.
- Public experience supports English/Arabic, LTR/RTL, responsive states and reduced motion.

The CSS variables in `app/assets/css/building-suit-runtime-tokens.css` are a minimal runtime projection of the canonical token values from `building-suit-monorepo/packages/design-tokens/tokens.json`; the monorepo remains the source of truth.


## Token integration note

The implementation uses `app/assets/css/building-suit-runtime-tokens.css` as a small runtime projection of the current monorepo token roles required by this dashboard/landing implementation. It deliberately does **not** overwrite the existing standalone site's generated `app/assets/css/building-suit-tokens.css` or its provenance lock when you overlay these files onto the current repository. The canonical editable source remains `building-suit-monorepo/packages/design-tokens/tokens.json`.
