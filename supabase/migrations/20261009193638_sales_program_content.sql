-- Additive content settings; existing public-read/admin-write RLS policies apply.
-- NULL sales_program uses the exact bundled Arabic page copy until first admin save.
alter table public.site_settings
  add column if not exists sales_program jsonb,
  add column if not exists social_links jsonb not null default '{}'::jsonb;

alter table public.site_settings
  add constraint sales_program_object check (sales_program is null or jsonb_typeof(sales_program) = 'object'),
  add constraint social_links_object check (jsonb_typeof(social_links) = 'object');
