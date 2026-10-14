-- BALBOLL V10: Run once in Supabase SQL Editor.
create table if not exists public.balboll_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.shoe_reviews (
 id uuid primary key default gen_random_uuid(), shoe_slug text not null, shoe_name text not null,
 source_name text not null, source_url text not null, review_title text not null,
 summary text not null, rating numeric(3,1) check (rating between 0 and 5),
 review_date date, published boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.shoe_edits (
 slug text primary key, name text, image_url text, width_feel text,
 daily numeric(5,1), long_run numeric(5,1), tempo numeric(5,1), cushion numeric(5,1), stability numeric(5,1),
 evidence_url text, evidence_note text, published boolean not null default false,
 updated_at timestamptz not null default now(),
 constraint valid_scores check (
 (daily is null or daily between 0 and 100) and (long_run is null or long_run between 0 and 100) and
 (tempo is null or tempo between 0 and 100) and (cushion is null or cushion between 0 and 100) and
 (stability is null or stability between 0 and 100))
);
create or replace function public.balboll_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.balboll_admins where user_id=auth.uid());
$$;
revoke all on function public.balboll_is_admin() from public;
grant execute on function public.balboll_is_admin() to authenticated, anon;
alter table public.balboll_admins enable row level security;
alter table public.shoe_reviews enable row level security;
alter table public.shoe_edits enable row level security;
drop policy if exists "admins read self" on public.balboll_admins;
create policy "admins read self" on public.balboll_admins for select to authenticated using (user_id=auth.uid());
drop policy if exists "public reads published reviews" on public.shoe_reviews;
create policy "public reads published reviews" on public.shoe_reviews for select to anon, authenticated using (published or public.balboll_is_admin());
drop policy if exists "admin insert reviews" on public.shoe_reviews;
create policy "admin insert reviews" on public.shoe_reviews for insert to authenticated with check (public.balboll_is_admin());
drop policy if exists "admin update reviews" on public.shoe_reviews;
create policy "admin update reviews" on public.shoe_reviews for update to authenticated using (public.balboll_is_admin()) with check (public.balboll_is_admin());
drop policy if exists "admin delete reviews" on public.shoe_reviews;
create policy "admin delete reviews" on public.shoe_reviews for delete to authenticated using (public.balboll_is_admin());
drop policy if exists "public reads published shoe edits" on public.shoe_edits;
create policy "public reads published shoe edits" on public.shoe_edits for select to anon, authenticated using (published or public.balboll_is_admin());
drop policy if exists "admin insert shoe edits" on public.shoe_edits;
create policy "admin insert shoe edits" on public.shoe_edits for insert to authenticated with check (public.balboll_is_admin());
drop policy if exists "admin update shoe edits" on public.shoe_edits;
create policy "admin update shoe edits" on public.shoe_edits for update to authenticated using (public.balboll_is_admin()) with check (public.balboll_is_admin());
drop policy if exists "admin delete shoe edits" on public.shoe_edits;
create policy "admin delete shoe edits" on public.shoe_edits for delete to authenticated using (public.balboll_is_admin());
grant select on public.shoe_reviews, public.shoe_edits to anon;
grant select, insert, update, delete on public.shoe_reviews, public.shoe_edits to authenticated;
grant select on public.balboll_admins to authenticated;
-- After creating your account under Authentication > Users, run (replace email):
-- insert into public.balboll_admins(user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com' on conflict do nothing;
