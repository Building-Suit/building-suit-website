-- Building Suit dynamic landing page + protected admin dashboard.
-- Apply once to a dedicated Supabase project for building-suit-website.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_landing_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_landing_admin() from public;
grant execute on function public.is_landing_admin() to anon, authenticated;

create table if not exists public.site_settings (
  id text primary key default 'homepage' check (id = 'homepage'),
  background_image_url text,
  background_image_path text,
  background_overlay_enabled boolean not null default false,
  background_overlay_color text not null default '#0B0B0D',
  background_overlay_opacity numeric(4,3) not null default 0.58 check (background_overlay_opacity between 0 and 1),
  logo_url text,
  logo_path text,
  cover_image_url text,
  cover_image_path text,
  coming_soon_text_en text not null default 'Coming Soon',
  coming_soon_text_ar text not null default 'قريبًا',
  helper_text_en text,
  helper_text_ar text,
  projects_title_en text not null default 'More from Building Suit.',
  projects_title_ar text not null default 'المزيد من Building Suit',
  projects_helper_text_en text,
  projects_helper_text_ar text,
  updated_at timestamptz not null default now()
);

create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text,
  description_en text,
  description_ar text,
  url text not null check (url ~* '^https?://'),
  logo_url text,
  logo_path text,
  ribbon_text_en text,
  ribbon_text_ar text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists project_links_set_updated_at on public.project_links;
create trigger project_links_set_updated_at before update on public.project_links
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.project_links enable row level security;

-- Explicit PostgREST privileges; RLS remains the authorization boundary.
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant select on public.project_links to anon, authenticated;
grant insert, update, delete on public.project_links to authenticated;
grant select on public.admin_users to authenticated;

-- Public page can read the singleton settings row.
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);

-- Only registered admin users can mutate settings.
drop policy if exists "Admins can insert site settings" on public.site_settings;
create policy "Admins can insert site settings" on public.site_settings
for insert to authenticated with check (public.is_landing_admin());

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings" on public.site_settings
for update to authenticated using (public.is_landing_admin()) with check (public.is_landing_admin());

drop policy if exists "Admins can delete site settings" on public.site_settings;
create policy "Admins can delete site settings" on public.site_settings
for delete to authenticated using (public.is_landing_admin());

-- Visitors only see published project cards. Admins can see hidden cards too.
drop policy if exists "Public can read visible project links" on public.project_links;
create policy "Public can read visible project links" on public.project_links
for select to anon, authenticated using (is_visible or public.is_landing_admin());

drop policy if exists "Admins can insert project links" on public.project_links;
create policy "Admins can insert project links" on public.project_links
for insert to authenticated with check (public.is_landing_admin());

drop policy if exists "Admins can update project links" on public.project_links;
create policy "Admins can update project links" on public.project_links
for update to authenticated using (public.is_landing_admin()) with check (public.is_landing_admin());

drop policy if exists "Admins can delete project links" on public.project_links;
create policy "Admins can delete project links" on public.project_links
for delete to authenticated using (public.is_landing_admin());

-- An authenticated account can verify only whether its own UUID is in admin_users.
drop policy if exists "Users can read their own admin row" on public.admin_users;
create policy "Users can read their own admin row" on public.admin_users
for select to authenticated using (user_id = auth.uid());

-- Public image bucket used by the landing page. Writes are admin-only through RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'landing-assets',
  'landing-assets',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read landing assets" on storage.objects;
create policy "Public can read landing assets" on storage.objects
for select to public using (bucket_id = 'landing-assets');

drop policy if exists "Admins can upload landing assets" on storage.objects;
create policy "Admins can upload landing assets" on storage.objects
for insert to authenticated with check (bucket_id = 'landing-assets' and public.is_landing_admin());

drop policy if exists "Admins can update landing assets" on storage.objects;
create policy "Admins can update landing assets" on storage.objects
for update to authenticated using (bucket_id = 'landing-assets' and public.is_landing_admin())
with check (bucket_id = 'landing-assets' and public.is_landing_admin());

drop policy if exists "Admins can delete landing assets" on storage.objects;
create policy "Admins can delete landing assets" on storage.objects
for delete to authenticated using (bucket_id = 'landing-assets' and public.is_landing_admin());

-- Seed the current public composition. Images use packaged fallbacks until an admin uploads replacements.
insert into public.site_settings (
  id, coming_soon_text_en, coming_soon_text_ar,
  helper_text_en, helper_text_ar,
  projects_title_en, projects_title_ar,
  projects_helper_text_en, projects_helper_text_ar
)
values (
  'homepage', 'Coming Soon', 'قريبًا',
  'Clarity you can trust.', 'وضوح تثق به.',
  'More from Building Suit.', 'المزيد من Building Suit',
  'Other platforms and systems we run.', 'منصّات وأنظمة أخرى نُشغّلها.'
)
on conflict (id) do nothing;

insert into public.project_links (
  title_en, title_ar, description_en, description_ar, url, sort_order, is_visible
)
select
  'Ledger Suit', 'Ledger Suit',
  'Business finance, clearly managed.', 'إدارة واضحة لماليات أعمالك.',
  'https://ledger.building-suit.com/', 10, true
where not exists (
  select 1 from public.project_links where url = 'https://ledger.building-suit.com/'
);
