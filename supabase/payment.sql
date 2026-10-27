-- Payment requests for a secure QR dining session.
-- Run once after qr-order-security.sql.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  dining_session_id uuid not null unique references public.dining_sessions(id) on delete cascade,
  table_code text not null,
  amount integer not null check (amount >= 0),
  method text not null check (method in ('cash', 'card', 'bank_transfer')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  reference text not null default ('PAY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

create or replace function public.request_qr_payment(p_table text, p_token text, p_method text)
returns setof public.payments
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session_id uuid;
  v_amount integer;
  v_payment_id uuid;
begin
  if p_method not in ('cash', 'card', 'bank_transfer') then
    raise exception 'Phương thức thanh toán không hợp lệ';
  end if;

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

  select coalesce(sum(o.total), 0)::integer into v_amount
  from public.orders o
  where o."diningSessionId" = v_session_id and o.status <> 'cancelled';

  if v_amount <= 0 then
    raise exception 'Phiên bàn chưa có đơn cần thanh toán';
  end if;

  insert into public.payments(dining_session_id, table_code, amount, method, status)
  values (v_session_id, upper(p_table), v_amount, p_method, 'pending')
  on conflict (dining_session_id) do update
    set amount = excluded.amount,
        method = excluded.method,
        status = case when public.payments.status = 'paid' then 'paid' else 'pending' end,
        created_at = case when public.payments.status = 'paid' then public.payments.created_at else now() end
  returning id into v_payment_id;

  return query select p.* from public.payments p where p.id = v_payment_id;
end;
$$;

create or replace function public.get_qr_payment(p_table text, p_token text)
returns setof public.payments
language sql
stable
security definer
set search_path = public, extensions
as $$
  select p.*
  from public.payments p
  join public.dining_sessions ds on ds.id = p.dining_session_id
  where ds.table_code = upper(p_table)
    and ds.token_hash = encode(digest(p_token, 'sha256'), 'hex')
  limit 1;
$$;

create or replace function public.confirm_payment(p_payment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_table text;
begin
  if not public.is_active_staff(array['service', 'manager', 'admin']) then
    raise exception 'Bạn không có quyền xác nhận thanh toán';
  end if;

  update public.payments
     set status = 'paid', paid_at = now()
   where id = p_payment_id and status = 'pending'
   returning dining_session_id, table_code into v_session_id, v_table;

  if v_session_id is null then raise exception 'Không tìm thấy yêu cầu thanh toán'; end if;
  update public.dining_sessions set status = 'closed', closed_at = now() where id = v_session_id;
  update public."tables" set status = 'cleaning' where code = v_table;
  return true;
end;
$$;

grant execute on function public.request_qr_payment(text, text, text) to anon, authenticated;
grant execute on function public.get_qr_payment(text, text) to anon, authenticated;
grant execute on function public.confirm_payment(uuid) to authenticated;

create policy "staff can read payments" on public.payments
  for select to authenticated using (public.is_active_staff(array['service', 'manager', 'admin']));
