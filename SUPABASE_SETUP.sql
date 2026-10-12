-- Supabase SQL Editor에서 실행. 관리자 계정은 Authentication > Users에서 직접 생성.
create extension if not exists pgcrypto;
create table if not exists public.rf_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.shoe_reviews (
 id uuid primary key default gen_random_uuid(),
 shoe_slug text not null,
 shoe_name text not null,
 source_name text not null,
 source_url text not null check (source_url ~ '^https?://'),
 review_title text not null,
 summary text not null,
 rating numeric(2,1) check (rating between 0 and 5),
 review_date date,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists shoe_reviews_public_idx on public.shoe_reviews(shoe_slug,created_at desc) where published;
alter table public.rf_admins enable row level security;
alter table public.shoe_reviews enable row level security;
create policy "admin own status" on public.rf_admins for select to authenticated using (user_id=auth.uid());
create policy "published public read" on public.shoe_reviews for select to anon,authenticated using (published or exists(select 1 from public.rf_admins where user_id=auth.uid()));
create policy "admin insert" on public.shoe_reviews for insert to authenticated with check (exists(select 1 from public.rf_admins where user_id=auth.uid()));
create policy "admin update" on public.shoe_reviews for update to authenticated using (exists(select 1 from public.rf_admins where user_id=auth.uid())) with check (exists(select 1 from public.rf_admins where user_id=auth.uid()));
create policy "admin delete" on public.shoe_reviews for delete to authenticated using (exists(select 1 from public.rf_admins where user_id=auth.uid()));
-- 계정 생성 후 관리자 UID를 복사하여 아래 구문을 별도 실행:
-- insert into public.rf_admins(user_id) values ('YOUR-ADMIN-USER-UUID');
