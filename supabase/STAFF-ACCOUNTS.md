# Tạo tài khoản nhân viên

Mỗi email phải được tạo trong **Supabase Dashboard → Authentication → Users → Add user** với mật khẩu riêng. Sau đó thêm cùng email vào bảng `staff` để gán vai trò:

```sql
insert into public.staff (id, name, email, role, status, shift) values
('u-kitchen-01', 'Minh Anh', 'bep@nhahang.vn', 'kitchen', 'active', 'Tối'),
('u-manager-01', 'Thu Hà', 'quanly@nhahang.vn', 'manager', 'active', 'Cả ngày'),
('u-admin-01', 'Hoàng Nam', 'admin@nhahang.vn', 'admin', 'active', 'Cả ngày')
on conflict (email) do update set role = excluded.role, status = excluded.status;
```

Tài khoản đăng nhập bằng email/mật khẩu Auth. Frontend lấy `role` từ bảng `staff` rồi chuyển hướng tự động; không còn nút chọn vai trò trên trang login.
