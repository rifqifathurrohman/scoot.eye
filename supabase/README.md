# Backoffice (Supabase) — setup

Project: `https://thdbbtbyrdvrxyxxsbgo.supabase.co` (free tier). Dashboard: https://scooteyewear.my.id/admin

The website reads prices, stock, Shopee ids and the promo end from Supabase and falls back to the
catalog built into `frontend/src/lib/catalog.ts` when Supabase is unreachable or empty. Only accounts
listed in `public.admins` can change anything (Row Level Security).

## One-time setup

1. **SQL Editor → New query**: paste and run `migrations/001_catalog.sql` (tables + security rules).
2. **SQL Editor → New query**: paste and run `migrations/002_catalog_seed.sql` (copies the current
   catalog: 9 models, 74 colours, promo end 29 Nov). Regenerate it with
   `python supabase/scripts/make_seed.py` if `catalog.ts` changed before you run it.
3. **Authentication → Users → Add user → Create new user**: your email + a strong password,
   tick "Auto Confirm User".
4. **SQL Editor**: make that account an admin (replace the email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'EMAIL-ADMIN@contoh.com';
   ```
5. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up".
   (Even if left on, strangers could only read the catalog, but there is no reason to allow it.)

## Rules

- The publishable key in `frontend/src/lib/supabase.ts` is meant to be public.
  **Never** put the secret / `service_role` key in the website or in this repo.
- Add another admin by repeating steps 3–4. Remove one with
  `delete from public.admins where user_id = (select id from auth.users where email = '...');`
- Free projects pause after ~7 days without any traffic; the website keeps working on its
  built-in data, and you can resume the project from the Supabase dashboard.
