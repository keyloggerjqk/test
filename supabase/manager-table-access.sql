-- Run once in Supabase SQL Editor for an existing MenuMind deployment.
-- Table operations and QR-session management belong to manager/service, not admin.

drop policy if exists "staff can update table status" on public."tables";
create policy "staff can update table status" on public."tables"
  for update to authenticated
  using (public.is_active_staff(array['service', 'manager']))
  with check (public.is_active_staff(array['service', 'manager']));

drop policy if exists "staff can create tables" on public."tables";
create policy "staff can create tables" on public."tables"
  for insert to authenticated
  with check (public.is_active_staff(array['service', 'manager']));

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
  if not public.is_active_staff(array['service', 'manager']) then
    raise exception 'Bạn không có quyền tạo phiên QR';
  end if;

  if not exists (select 1 from public."tables" t where t.code = upper(p_table)) then
    raise exception 'Bàn không tồn tại';
  end if;

  update public.dining_sessions ds
     set status = 'closed', closed_at = now()
   where ds.table_code = upper(p_table) and ds.status = 'active';

  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.dining_sessions(table_code, token_hash, created_by, expires_at)
  values (upper(p_table), encode(digest(v_token, 'sha256'), 'hex'), auth.uid(), v_expiry);

  update public."tables" t set status = 'occupied' where t.code = upper(p_table);
  return query select v_token, upper(p_table), v_expiry;
end;
$$;

create or replace function public.close_dining_session(p_table text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_staff(array['service', 'manager']) then
    raise exception 'Bạn không có quyền đóng phiên QR';
  end if;

  update public.dining_sessions
     set status = 'closed', closed_at = now()
   where table_code = upper(p_table) and status = 'active';
  update public."tables" set status = 'cleaning' where code = upper(p_table);
  return true;
end;
$$;

grant execute on function public.create_dining_session(text) to authenticated;
grant execute on function public.close_dining_session(text) to authenticated;
