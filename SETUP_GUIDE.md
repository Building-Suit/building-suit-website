# Setup Guide

## 1. Create a dedicated Supabase project

Create one new Supabase project for the Building Suit website. Keep this website isolated from Ledger Suit and Shop Suit so Auth, Storage and content policies are independent.

## 2. Apply the database migration

Open Supabase Dashboard -> SQL Editor -> New query. Copy the full contents of:

`supabase/migrations/20260922190000_dynamic_landing.sql`

Run it once. It creates:

- `public.site_settings`
- `public.project_links`
- `public.admin_users`
- RLS policies
- `landing-assets` Storage bucket
- current Coming Soon seed content
- Ledger Suit seed project

## 3. Create the first admin user

In Supabase Dashboard -> Authentication -> Users -> Add user, create your admin email/password.

Copy that user's UUID.

Open SQL Editor and run:

```sql
insert into public.admin_users (user_id)
values ('PASTE_AUTH_USER_UUID_HERE')
on conflict (user_id) do nothing;
```

There is intentionally no public admin signup route.

## 4. Add local environment values

From the project folder:

```bash
cp .env.example .env
```

In Supabase Dashboard -> Connect, copy the Project URL and publishable/anon key into `.env`:

```env
APP_ENV=local
APP_BASE_URL=http://localhost:3000
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NUXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Never put a secret/service-role key in these browser variables.

## 5. Install and run

```bash
corepack enable
pnpm install
pnpm dev
```

Open:

- Public page: `http://localhost:3000/`
- Admin login: `http://localhost:3000/admin/login`

## 6. Configure the page

Log in to `/admin/login` and save your desired background, overlay, logo, optional cover, texts and project cards. Uploaded images go to the public `landing-assets` bucket, but only registered admins can upload/delete them.

## 7. Deploy on Vercel

Create or update the Vercel project for this repository. Add these Environment Variables for Production (and Preview if you use it):

- `APP_ENV=production`
- `APP_BASE_URL=https://building-suit.com` (use your real final URL)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_KEY`

Use the same Supabase Project URL and the same browser-safe publishable/anon key for each matching pair.

Recommended Vercel settings:

- Framework Preset: Nuxt.js
- Install Command: `pnpm install --frozen-lockfile` after you commit a generated `pnpm-lock.yaml`; until then use `pnpm install`
- Build Command: `pnpm build`
- Output: auto-detected by Nuxt

## 8. Supabase Auth URLs

Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL: your production website URL.
- Add `http://localhost:3000/**` for local development if needed.
- Add the production domain as an allowed redirect URL.

Password login is used; no OAuth callback is required by this project.

## 9. Verification checklist

After deployment verify:

1. `/` loads for a signed-out visitor.
2. Public visitor cannot write to `site_settings`, `project_links` or Storage.
3. `/admin` redirects signed-out users to `/admin/login`.
4. A normal Auth user not in `admin_users` is rejected.
5. Your registered admin can upload, edit, reorder, hide and delete project cards.
6. Cover image layout works with a cover and returns to centered layout when removed.
7. English/Arabic switch works and RTL layout is correct.
8. Mobile page scrolls when content exceeds the viewport.
