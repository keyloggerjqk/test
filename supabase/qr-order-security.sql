-- Secure QR dining sessions for MenuMind.
-- Run once in Supabase SQL Editor after schema.sql and seed.sql.

create table if not exists public.dining_sessions (
  id uuid primary key default gen_random_uuid(),
  table_code text not null references public."tables"(code),
  token_hash text not null unique,
  status text not null default 'active' check (status in ('active', 'closed', 'expired')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '8 hours'),
  closed_at timestamptz
);

alter table public.dining_sessions enable row level security;

alter table public.orders
  add column if not exists "diningSessionId" uuid references public.dining_sessions(id);

create or replace function public.create_dining_session(p_table text)
returns table(token text, table_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
  v_expiry timestamptz := now() + interval '8 hours';
begin
  if not exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'active'
      and role in ('service', 'manager')
  ) then
    raise exception 'Bạn không có quyền tạo phiên QR';
  end if;

  if not exists (select 1 from public."tables" where code = upper(p_table)) then
    raise exception 'Bàn không tồn tại';
  end if;

  update public.dining_sessions ds
     set status = 'closed', closed_at = now()
   where ds.table_code = upper(p_table) and ds.status = 'active';

  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.dining_sessions(table_code, token_hash, created_by, expires_at)
  values (upper(p_table), encode(digest(v_token, 'sha256'), 'hex'), auth.uid(), v_expiry);

  update public."tables" set status = 'occupied' where code = upper(p_table);
  return query select v_token, upper(p_table), v_expiry;
end;
$$;

create or replace function public.validate_dining_session(p_table text, p_token text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.dining_sessions
    where table_code = upper(p_table)
      and token_hash = encode(digest(p_token, 'sha256'), 'hex')
      and status = 'active'
      and expires_at > now()
  );
$$;

create or replace function public.place_qr_order(
  p_table text,
  p_token text,
  p_order_id text,
  p_items jsonb,
  p_total integer,
  p_note text default ''
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session_id uuid;
begin
  select ds.id into v_session_id
  from public.dining_sessions ds
  where ds.table_code = upper(p_table)
    and ds.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and ds.status = 'active'
    and ds.expires_at > now()
  for update;

  if v_session_id is null then
    raise exception 'Phiên QR không hợp lệ hoặc đã hết hạn';
  end if;

  if exists (
    select 1
    from public.payments p
    where p.dining_session_id = v_session_id
      and p.status in ('pending', 'paid')
  ) then
    raise exception 'Phiên bàn đã yêu cầu hoặc hoàn tất thanh toán; không thể gửi thêm món';
  end if;

  insert into public.orders(id, "table", status, priority, wait, note, total, items, "diningSessionId")
  values (p_order_id, upper(p_table), 'new', false, 0, coalesce(p_note, ''), greatest(p_total, 0), p_items, v_session_id);
  return p_order_id;
end;
$$;

create or replace function public.get_qr_orders(p_table text, p_token text)
returns setof public.orders
language sql
stable
security definer
set search_path = public, extensions
as $$
  select o.*
  from public.orders o
  join public.dining_sessions ds on ds.id = o."diningSessionId"
  where ds.table_code = upper(p_table)
    and ds.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and ds.status = 'active'
    and ds.expires_at > now()
  order by o."createdAt" desc;
$$;

create or replace function public.close_dining_session(p_table text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'active'
      and role in ('service', 'manager')
  ) then
    raise exception 'Bạn không có quyền đóng phiên QR';
  end if;

  update public.dining_sessions
     set status = 'closed', closed_at = now()
   where table_code = upper(p_table) and status = 'active';
  update public."tables" set status = 'cleaning' where code = upper(p_table);
  return true;
end;
$$;

-- Customers may only call the two narrow RPCs below. They cannot read tokens.
revoke all on public.dining_sessions from anon, authenticated;
grant execute on function public.validate_dining_session(text, text) to anon, authenticated;
grant execute on function public.place_qr_order(text, text, text, jsonb, integer, text) to anon, authenticated;
grant execute on function public.get_qr_orders(text, text) to anon, authenticated;
grant execute on function public.create_dining_session(text) to authenticated;
grant execute on function public.close_dining_session(text) to authenticated;

-- Remove the broad public order insert policy, if it was enabled earlier.
drop policy if exists "public can create orders" on public.orders;
drop policy if exists "public can update orders" on public.orders;
drop policy if exists "public can update menu availability" on public."menuItems";
drop policy if exists "public can update table status" on public."tables";
drop policy if exists "public can read staff" on public.staff;
drop policy if exists "public can read orders" on public.orders;
drop policy if exists "public can read order items" on public."orderItems";
drop policy if exists "public can read feedback" on public.feedback;

create or replace function public.is_active_staff(p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'active'
      and (p_roles is null or role = any(p_roles))
  );
$$;

grant execute on function public.is_active_staff(text[]) to authenticated;

create policy "active staff can read staff" on public.staff
  for select to authenticated using (public.is_active_staff(null));

create policy "active staff can read orders" on public.orders
  for select to authenticated using (public.is_active_staff(null));

create policy "active staff can update orders" on public.orders
  for update to authenticated using (public.is_active_staff(null))
  with check (public.is_active_staff(null));

create policy "active staff can read order items" on public."orderItems"
  for select to authenticated using (public.is_active_staff(null));

create policy "active staff can read feedback" on public.feedback
  for select to authenticated using (public.is_active_staff(null));

create policy "manager can update menu availability" on public."menuItems"
  for update to authenticated using (public.is_active_staff(array['manager','admin']))
  with check (public.is_active_staff(array['manager','admin']));

create policy "staff can update table status" on public."tables"
  for update to authenticated using (public.is_active_staff(array['service','manager']))
  with check (public.is_active_staff(array['service','manager']));

create policy "staff can create tables" on public."tables"
  for insert to authenticated
  with check (public.is_active_staff(array['service','manager']));
