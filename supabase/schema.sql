-- MenuMind database schema
-- Run this file once in Supabase Dashboard > SQL Editor.
-- Keep Row Level Security enabled. Add Auth-based policies before production writes.

create extension if not exists pgcrypto;

create table if not exists public."menuItems" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  time integer not null default 15 check (time > 0),
  spicy smallint not null default 0 check (spicy between 0 and 3),
  vegetarian boolean not null default false,
  available boolean not null default true,
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  orders integer not null default 0 check (orders >= 0),
  emoji text not null default '🍽️',
  image text not null default '',
  description text not null default '',
  tags text[] not null default '{}'
);

create table if not exists public."tables" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  code text not null unique,
  zone text not null,
  seats smallint not null check (seats > 0),
  status text not null default 'available' check (status in ('available','occupied','reserved','cleaning'))
);

create table if not exists public.staff (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('kitchen','manager','admin','service')),
  status text not null default 'active' check (status in ('active','inactive')),
  shift text not null default 'Cả ngày'
);

create table if not exists public.orders (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "table" text not null,
  status text not null default 'new' check (status in ('new','cooking','ready','served','cancelled')),
  priority boolean not null default false,
  wait integer not null default 0 check (wait >= 0),
  note text not null default '',
  total integer not null default 0 check (total >= 0),
  items jsonb not null default '[]'::jsonb
);

create table if not exists public."orderItems" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "orderId" text not null references public.orders(id) on delete cascade,
  "menuId" text not null references public."menuItems"(id),
  qty integer not null check (qty > 0),
  note text not null default '',
  "unitPrice" integer not null check ("unitPrice" >= 0)
);

create table if not exists public.feedback (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "orderId" text references public.orders(id) on delete set null,
  "table" text not null,
  rating smallint not null check (rating between 1 and 5),
  text text not null,
  theme text not null default 'Chưa phân loại',
  status text not null default 'new' check (status in ('new','replied','archived'))
);

alter table public."menuItems" enable row level security;
alter table public."tables" enable row level security;
alter table public.staff enable row level security;
alter table public.orders enable row level security;
alter table public."orderItems" enable row level security;
alter table public.feedback enable row level security;

-- Read-only public policies. Write policies should be added after Supabase Auth roles are configured.
create policy "public can read menu" on public."menuItems" for select to anon, authenticated using (true);
create policy "public can read tables" on public."tables" for select to anon, authenticated using (true);
create policy "public can read staff" on public.staff for select to anon, authenticated using (true);
create policy "public can read orders" on public.orders for select to anon, authenticated using (true);
create policy "public can read order items" on public."orderItems" for select to anon, authenticated using (true);
create policy "public can read feedback" on public.feedback for select to anon, authenticated using (true);
