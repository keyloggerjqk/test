-- Khóa gọi món sau khi khách đã yêu cầu hoặc hoàn tất thanh toán.
-- Chạy một lần trong Supabase SQL Editor sau payment.sql.

begin;

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
  -- Khóa phiên bàn để việc gửi đơn và yêu cầu thanh toán không thể chạy chen nhau.
  select ds.id into v_session_id
  from public.dining_sessions ds
  where ds.table_code = upper(p_table)
    and ds.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and ds.status = 'active'
    and ds.expires_at > now()
  for update;

  if v_session_id is null then
    raise exception 'Phiên QR không hợp lệ, đã hết hạn hoặc đã thanh toán';
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

  -- Dùng cùng khóa với place_qr_order để số tiền luôn bao gồm mọi đơn đã nhận.
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
  where o."diningSessionId" = v_session_id
    and o.status <> 'cancelled';

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

  return query
  select p.*
  from public.payments p
  where p.id = v_payment_id;
end;
$$;

grant execute on function public.place_qr_order(text, text, text, jsonb, integer, text) to anon, authenticated;
grant execute on function public.request_qr_payment(text, text, text) to anon, authenticated;

commit;
