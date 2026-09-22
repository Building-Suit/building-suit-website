# Building Suit Website — Typecheck hotfix

This patch addresses the 9 TypeScript errors reported by `pnpm typecheck` after the dynamic landing/admin implementation.

## Fixes

1. `app/app.vue` — changes `htmlAttrs` from a `ComputedRef<object>` to a `useHead` resolver so Unhead/Nuxt receives the correct reactive shape.
2. `app/composables/useLandingLocale.ts` — restores the legacy `copy` computed value required by the original `BrandIdentity.vue` and `PlatformsRail.vue` files that still exist in the repository after the overlay.
3. `app/types/database.types.ts` — adds typed Supabase schema definitions for `admin_users`, `site_settings`, and `project_links`.
4. Supabase callers — use `useSupabaseClient<Database>()` so `.insert()` and `.update()` no longer infer payloads as `never`.
5. `app/pages/admin/index.vue` — explicitly types settings/project mutation payloads.
6. `nuxt.config.ts` — removes direct `process.env` use from the cookie prefix, so Node global types are not required just to typecheck Nuxt config.

No SQL, Supabase policy, package, or environment-variable changes are required for this patch.

## Apply

```bash
cd /home/tareq/Dev/building-suit-website

rm -rf /tmp/building-suit-typecheck-hotfix
mkdir -p /tmp/building-suit-typecheck-hotfix

unzip ~/Downloads/building-suit-website-typecheck-hotfix.zip \
  -d /tmp/building-suit-typecheck-hotfix

rsync -av \
  /tmp/building-suit-typecheck-hotfix/building-suit-website-typecheck-hotfix/ \
  ./

rm -rf .nuxt
pnpm typecheck
```

If typecheck passes, run:

```bash
pnpm lint
pnpm build
```

Do not commit or deploy until all three pass.
