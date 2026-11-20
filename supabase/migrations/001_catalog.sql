-- SCOOT Eyewear backoffice, phase 1: editable catalog (price, promo, stock) behind admin-only writes.
-- Run once in Supabase → SQL Editor. Safe to re-run: every statement is idempotent.

-- Who may edit. Rows are added by hand in the SQL Editor (see supabase/README.md); there is no
-- self-service way to become an admin, so a stranger who signs up can still only read.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  opening_price integer check (opening_price >= 0),
  shopee_item_id text,
  active boolean not null default true,
  sort_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  product_id text not null references public.products (id) on delete cascade,
  code text not null,
  -- null = keep the colour name built into the website
  color_name text,
  stock integer not null default 0 check (stock >= 0),
  sort_index integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (product_id, code)
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
drop trigger if exists product_variants_touch on public.product_variants;
create trigger product_variants_touch before update on public.product_variants
  for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- Row Level Security: everyone may read the catalog; only admins may change it.
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.settings enable row level security;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "catalog readable" on public.products;
create policy "catalog readable" on public.products for select to anon, authenticated using (true);
drop policy if exists "catalog admin insert" on public.products;
create policy "catalog admin insert" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "catalog admin update" on public.products;
create policy "catalog admin update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "catalog admin delete" on public.products;
create policy "catalog admin delete" on public.products for delete to authenticated using (public.is_admin());

drop policy if exists "variants readable" on public.product_variants;
create policy "variants readable" on public.product_variants for select to anon, authenticated using (true);
drop policy if exists "variants admin insert" on public.product_variants;
create policy "variants admin insert" on public.product_variants for insert to authenticated with check (public.is_admin());
drop policy if exists "variants admin update" on public.product_variants;
create policy "variants admin update" on public.product_variants for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "variants admin delete" on public.product_variants;
create policy "variants admin delete" on public.product_variants for delete to authenticated using (public.is_admin());

drop policy if exists "settings readable" on public.settings;
create policy "settings readable" on public.settings for select to anon, authenticated using (true);
drop policy if exists "settings admin insert" on public.settings;
create policy "settings admin insert" on public.settings for insert to authenticated with check (public.is_admin());
drop policy if exists "settings admin update" on public.settings;
create policy "settings admin update" on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.products, public.product_variants, public.settings to anon, authenticated;
grant insert, update, delete on public.products, public.product_variants, public.settings to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
