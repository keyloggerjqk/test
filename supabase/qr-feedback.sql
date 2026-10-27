-- Lưu phản hồi thật từ khách dùng QR mà không cho trình duyệt ghi trực tiếp vào bảng.
-- Chạy sau qr-order-security.sql và payment.sql trong Supabase SQL Editor.

begin;

alter table public.feedback
  add column if not exists dining_session_id uuid
  references public.dining_sessions(id) on delete set null;

create unique index if not exists feedback_one_per_dining_session_idx
  on public.feedback(dining_session_id)
  where dining_session_id is not null;

alter table public.feedback enable row level security;
revoke insert, update, delete on public.feedback from anon, authenticated;
revoke select on public.feedback from anon;
grant select on public.feedback to authenticated;

drop policy if exists "public can read feedback" on public.feedback;
drop policy if exists "active staff can read feedback" on public.feedback;
create policy "active staff can read feedback" on public.feedback
  for select to authenticated
  using (public.is_active_staff(array['manager', 'admin']));

create or replace function public.submit_qr_feedback(
  p_table text,
  p_token text,
  p_rating integer,
  p_text text
)
returns setof public.feedback
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session_id uuid;
  v_order_id text;
  v_feedback_id text;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Số sao phải từ 1 đến 5';
  end if;

  if char_length(btrim(coalesce(p_text, ''))) < 8 then
    raise exception 'Nội dung phản hồi phải có ít nhất 8 ký tự';
  end if;

  if char_length(btrim(p_text)) > 1000 then
    raise exception 'Nội dung phản hồi không được quá 1000 ký tự';
  end if;

  select session.id into v_session_id
  from public.dining_sessions session
  where session.table_code = upper(btrim(p_table))
    and session.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and session.expires_at > now()
    and (
      session.status = 'active'
      or (session.status = 'closed' and session.closed_at >= now() - interval '30 minutes')
    )
  for update;

  if v_session_id is null then
    raise exception 'Phiên QR không hợp lệ hoặc đã hết thời gian đánh giá';
  end if;

  if not exists (
    select 1 from public.payments payment
    where payment.dining_session_id = v_session_id
      and payment.status in ('pending', 'paid')
  ) then
    raise exception 'Vui lòng yêu cầu thanh toán trước khi đánh giá';
  end if;

  select orders.id into v_order_id
  from public.orders orders
  where orders."diningSessionId" = v_session_id
    and orders.status <> 'cancelled'
  order by orders."createdAt" desc
  limit 1;

  v_feedback_id := 'f-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

  insert into public.feedback (
    id, "orderId", "table", rating, text, theme, status, dining_session_id
  ) values (
    v_feedback_id,
    v_order_id,
    upper(btrim(p_table)),
    p_rating,
    btrim(p_text),
    'Chưa phân loại',
    'new',
    v_session_id
  )
  on conflict (dining_session_id) where dining_session_id is not null
  do update set
    rating = excluded.rating,
    text = excluded.text,
    theme = 'Chưa phân loại',
    status = 'new',
    "createdAt" = now()
  returning id into v_feedback_id;

  return query
  select item.* from public.feedback item where item.id = v_feedback_id;
end;
$$;

revoke all on function public.submit_qr_feedback(text, text, integer, text) from public;
grant execute on function public.submit_qr_feedback(text, text, integer, text) to anon, authenticated;

commit;

-- Kiểm tra sau khi khách gửi đánh giá:
select id, "table", rating, text, theme, status, "createdAt"
from public.feedback
order by "createdAt" desc;
