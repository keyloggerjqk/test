# Supabase setup cho MenuMind

1. Mở project Supabase `wgodxorzhdvuxazpoxkb`.
2. Vào **SQL Editor** → **New query**.
3. Dán toàn bộ nội dung `supabase/schema.sql` và bấm **Run**.
4. Chạy `supabase/expand-menu.sql` để thêm trường ảnh và đủ 24 món, sau đó chạy `supabase/seed.sql` cho dữ liệu mẫu còn lại.
5. Chạy `supabase/menu-image-upload.sql` để tạo bucket ảnh và cho Quản lý thêm món mới.
6. Chạy `supabase/qr-order-security.sql`, rồi `supabase/payment.sql` để bật phiên QR và thanh toán tại bàn.
7. Chạy `supabase/lock-orders-after-payment.sql` để khóa gửi món sau khi yêu cầu hoặc hoàn tất thanh toán.
8. Chạy `supabase/manager-table-access.sql` để cấp quyền quản lý bàn và đóng/mở phiên QR cho Quản lý & Phục vụ.
9. Chạy `supabase/qr-feedback.sql` để khách gửi đánh giá thật bằng phiên QR và để Quản lý/Quản trị xem phản hồi.
10. Sau khi tạo các tài khoản trong **Authentication → Users**, chạy `supabase/repair-staff-directory.sql` để đồng bộ tài khoản với bảng `staff` và sửa quyền đọc danh sách nhân viên.
11. Kiểm tra các bảng trong **Table Editor** và bucket `menu-images` trong **Storage**.
12. Bật Auth và áp dụng đầy đủ chính sách ghi dữ liệu theo vai trò trước khi đưa lên production.

Frontend dùng REST API thuần JavaScript:

```text
https://wgodxorzhdvuxazpoxkb.supabase.co/rest/v1/menuItems
```

Chỉ dùng publishable key ở trình duyệt. Không đưa secret/service role key vào HTML hoặc JavaScript public.
