-- SCOOT Eyewear backoffice, phase 1b: first-party visitor analytics.
-- Run once in Supabase → SQL Editor (after 001). Safe to re-run.
--
-- Privacy: no names, emails, phone numbers or IP addresses are stored. A visitor is a random id
-- kept in that browser's localStorage, used only to count unique visitors. Referrers are stored
-- as a host name only (e.g. "l.instagram.com"), never a full URL.

create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (type in (
    'page_view', 'shopee_click', 'whatsapp_click', 'instagram_click', 'add_to_cart', 'checkout', 'custom_design'
  )),
  path text not null check (char_length(path) <= 200),
  product_id text check (char_length(product_id) <= 40),
  visitor_id uuid not null,
  source text check (char_length(source) <= 80),
  device text check (device in ('mobile', 'desktop'))
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_created_idx on public.events (type, created_at desc);

alter table public.events enable row level security;

-- Visitors may only add events (never read, change or delete them); only admins can read.
drop policy if exists "anyone can log events" on public.events;
create policy "anyone can log events" on public.events
  for insert to anon, authenticated
  with check (created_at > now() - interval '5 minutes' and created_at < now() + interval '5 minutes');
drop policy if exists "admins read events" on public.events;
create policy "admins read events" on public.events
  for select to authenticated using (public.is_admin());
drop policy if exists "admins delete events" on public.events;
create policy "admins delete events" on public.events
  for delete to authenticated using (public.is_admin());

grant insert (type, path, product_id, visitor_id, source, device) on public.events to anon, authenticated;
grant select, delete on public.events to authenticated;

-- One round trip for the dashboard: totals, a per-day series, and top lists for the period.
create or replace function public.analytics_summary(days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta'
                        - make_interval(days => greatest(1, least(days, 365)) - 1);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  with e as (select * from public.events where created_at >= since)
  select jsonb_build_object(
    'since', since,
    'totals', (
      select jsonb_build_object(
        'visitors', count(distinct visitor_id),
        'page_view', count(*) filter (where type = 'page_view'),
        'shopee_click', count(*) filter (where type = 'shopee_click'),
        'whatsapp_click', count(*) filter (where type = 'whatsapp_click'),
        'instagram_click', count(*) filter (where type = 'instagram_click'),
        'add_to_cart', count(*) filter (where type = 'add_to_cart'),
        'checkout', count(*) filter (where type = 'checkout'),
        'custom_design', count(*) filter (where type = 'custom_design'),
        'mobile_share', round(100.0 * count(distinct visitor_id) filter (where device = 'mobile')
                          / nullif(count(distinct visitor_id), 0))
      ) from e
    ),
    'daily', (
      select coalesce(jsonb_agg(row_to_json(d) order by d.day), '[]'::jsonb) from (
        select gs::date as day,
               count(distinct e.visitor_id) as visitors,
               count(*) filter (where e.type = 'page_view') as page_view,
               count(*) filter (where e.type = 'shopee_click') as shopee_click,
               count(*) filter (where e.type = 'whatsapp_click' or e.type = 'checkout') as whatsapp
        from generate_series((since at time zone 'Asia/Jakarta')::date, (now() at time zone 'Asia/Jakarta')::date, interval '1 day') gs
        left join e on (e.created_at at time zone 'Asia/Jakarta')::date = gs::date
        group by gs
      ) d
    ),
    'products', (
      select coalesce(jsonb_agg(row_to_json(p) order by p.views desc, p.shopee_click desc), '[]'::jsonb) from (
        select product_id,
               count(*) filter (where type = 'page_view') as views,
               count(*) filter (where type = 'shopee_click') as shopee_click,
               count(*) filter (where type = 'whatsapp_click') as whatsapp_click,
               count(*) filter (where type = 'add_to_cart') as add_to_cart
        from e where product_id is not null group by product_id
      ) p
    ),
    'pages', (
      select coalesce(jsonb_agg(row_to_json(p) order by p.views desc), '[]'::jsonb) from (
        select path, count(*) as views from e where type = 'page_view' group by path order by views desc limit 10
      ) p
    ),
    'sources', (
      select coalesce(jsonb_agg(row_to_json(s) order by s.visitors desc), '[]'::jsonb) from (
        select coalesce(source, 'langsung') as source, count(distinct visitor_id) as visitors
        from e where type = 'page_view' group by 1 order by visitors desc limit 8
      ) s
    )
  ) into result;
  return result;
end;
$$;

revoke all on function public.analytics_summary(integer) from public, anon;
grant execute on function public.analytics_summary(integer) to authenticated;
