# Building Suit Website — Dynamic Landing + Admin

This is a hand-built upgrade of the existing `Building-Suit/building-suit-website` concept. The public Coming Soon page is now data-driven from Supabase and includes a protected `/admin` dashboard.

## What the dashboard controls

- Background image.
- Optional background overlay, including color and opacity.
- Logo.
- Optional cover image. The public hero becomes a responsive two-column composition only when a cover exists; without it, the original centered composition is preserved.
- Coming Soon text in English and Arabic.
- Optional helper/slogan text in English and Arabic.
- Additional apps/websites/projects with link, logo, bilingual title/description, optional bilingual ribbon, visibility and order.

## Stack and design alignment

- Nuxt 4 + Vue 3 + TypeScript strict.
- Supabase Auth, Postgres, Storage and RLS.
- PrimeVue 4 in unstyled mode.
- Tailwind CSS 4 via Vite.
- Manrope + IBM Plex Sans Arabic.
- Building Navy + Premium Gold and the neutral palette promoted in the Building Suit monorepo shared design system.
- Responsive English/Arabic and LTR/RTL public page.

See `SETUP_GUIDE.md` for the exact setup sequence.
