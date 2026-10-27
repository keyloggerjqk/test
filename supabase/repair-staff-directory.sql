-- Sửa danh sách tài khoản trống do Auth và public.staff chưa đồng bộ.
-- Chạy một lần trong Supabase SQL Editor bằng tài khoản chủ project.

begin;

-- Chỉ đồng bộ các email nhân viên đã được khai báo rõ vai trò.
-- Không tự cấp quyền admin cho email lạ.
with account_map(email, name, role, shift) as (
  values
    ('admin@nhahang.vn', 'Hoàng Nam', 'admin', 'Cả ngày'),
    ('quanly@nhahang.vn', 'Thu Hà', 'manager', 'Cả ngày'),
    ('bep@nhahang.vn', 'Minh Anh', 'kitchen', 'Tối'),
    ('phucvu@nhahang.vn', 'Linh Chi', 'service', 'Sáng'),
    ('hoangnam@menumind.vn', 'Hoàng Nam', 'admin', 'Cả ngày'),
    ('thuha@menumind.vn', 'Thu Hà', 'manager', 'Cả ngày'),
    ('minhanh@menumind.vn', 'Minh Anh', 'kitchen', 'Chiều'),
    ('quocbao@menumind.vn', 'Quốc Bảo', 'kitchen', 'Tối'),
    ('linhchi@menumind.vn', 'Linh Chi', 'service', 'Sáng')
)
insert into public.staff (id, name, email, role, status, shift)
select
  auth_user.id::text,
  account.name,
  lower(auth_user.email),
  account.role,
  'active',
  account.shift
from auth.users auth_user
join account_map account on lower(account.email) = lower(auth_user.email)
where auth_user.email is not null
on conflict (email) do update
set name = excluded.name,
    role = excluded.role,
    status = 'active',
    shift = excluded.shift;

-- Hàm kiểm tra vai trò chạy với quyền chủ sở hữu và không bị RLS tự chặn.
create or replace function public.is_active_staff(p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.staff member
    where lower(member.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and member.status = 'active'
      and (p_roles is null or member.role = any(p_roles))
  );
$$;

revoke all on public.staff from anon;
grant select on public.staff to authenticated;
grant execute on function public.is_active_staff(text[]) to authenticated;

drop policy if exists "public can read staff" on public.staff;
drop policy if exists "active staff can read staff" on public.staff;
create policy "active staff can read staff" on public.staff
  for select to authenticated
  using (public.is_active_staff(null));

-- Admin tạo hồ sơ cho một tài khoản đã tồn tại trong Authentication.
-- Không mở INSERT trực tiếp trên bảng staff cho trình duyệt.
create or replace function public.create_staff_profile(
  p_name text,
  p_email text,
  p_role text,
  p_shift text
)
returns setof public.staff
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_auth_id uuid;
  v_staff_id text;
begin
  if not public.is_active_staff(array['admin']) then
    raise exception 'Chỉ quản trị viên được tạo hồ sơ nhân viên';
  end if;

  if char_length(btrim(coalesce(p_name, ''))) < 3 then
    raise exception 'Họ tên phải có ít nhất 3 ký tự';
  end if;

  if p_role not in ('kitchen', 'manager', 'service') then
    raise exception 'Vai trò không hợp lệ';
  end if;

  select account.id into v_auth_id
  from auth.users account
  where lower(account.email) = lower(btrim(p_email))
  limit 1;

  if v_auth_id is null then
    raise exception 'Email chưa tồn tại trong Authentication → Users';
  end if;

  insert into public.staff (id, name, email, role, status, shift)
  values (
    v_auth_id::text,
    btrim(p_name),
    lower(btrim(p_email)),
    p_role,
    'active',
    coalesce(nullif(btrim(p_shift), ''), 'Cả ngày')
  )
  on conflict (email) do update
  set name = excluded.name,
      role = excluded.role,
      status = 'active',
      shift = excluded.shift
  returning id into v_staff_id;

  return query select member.* from public.staff member where member.id = v_staff_id;
end;
$$;

-- Admin bật/tắt tài khoản; tài khoản đang đăng nhập không thể tự khóa chính mình.
create or replace function public.set_staff_status(p_staff_id text, p_status text)
returns setof public.staff
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_staff_id text;
begin
  if not public.is_active_staff(array['admin']) then
    raise exception 'Chỉ quản trị viên được thay đổi trạng thái tài khoản';
  end if;

  if p_status not in ('active', 'inactive') then
    raise exception 'Trạng thái tài khoản không hợp lệ';
  end if;

  if p_staff_id = auth.uid()::text or exists (
    select 1 from public.staff current_member
    where current_member.id = p_staff_id
      and lower(current_member.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ) then
    raise exception 'Không thể vô hiệu hóa tài khoản đang đăng nhập';
  end if;

  update public.staff
  set status = p_status
  where id = p_staff_id
  returning id into v_staff_id;

  if v_staff_id is null then
    raise exception 'Không tìm thấy hồ sơ nhân viên';
  end if;

  return query select member.* from public.staff member where member.id = v_staff_id;
end;
$$;

revoke all on function public.create_staff_profile(text, text, text, text) from public;
revoke all on function public.set_staff_status(text, text) from public;
grant execute on function public.create_staff_profile(text, text, text, text) to authenticated;
grant execute on function public.set_staff_status(text, text) to authenticated;

commit;

-- Kiểm tra sau khi chạy:
select id, name, email, role, status, shift
from public.staff
order by role, name;
