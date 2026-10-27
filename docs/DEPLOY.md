# Deploy MenuMind

## 1. Chuẩn bị Supabase

Trong SQL Editor chạy đúng thứ tự:

1. `supabase/schema.sql`
2. `supabase/expand-menu.sql` (thêm 24 món và đường dẫn ảnh)
3. `supabase/seed.sql` (chỉ cần chạy lần đầu)
4. `supabase/qr-order-security.sql`
5. `supabase/payment.sql`

`qr-order-security.sql` tạo phiên QR theo từng lượt dùng bàn, chỉ cho khách đặt món qua mã còn hiệu lực và chỉ cho nhân viên đã đăng nhập cập nhật trạng thái.

## 2. Cấu hình frontend

Thông tin REST API nằm ở `assets/config/supabase.json`. Chỉ dùng publishable key. Không đưa `service_role` key lên server tĩnh hoặc vào Git.

## 3. Deploy lên hosting tĩnh

Upload nguyên thư mục dự án lên Netlify, Vercel Static, GitHub Pages, Cloudflare Pages hoặc hosting Apache/Nginx. Không cần Node, npm, build command hay backend riêng.

Nếu hosting có cấu hình build, để trống build command và đặt thư mục publish là thư mục gốc chứa `index.html`.

## 4. Kiểm tra sau deploy

- Đăng nhập nhân viên, mở quản lý bàn và cấp một mã QR mới.
- Quét QR hoặc mở liên kết `?table=B05&id=...` để kiểm tra menu.
- Thêm món, gửi đơn; kiểm tra bảng `orders` trong Supabase.
- Mở `/pages/kitchen-board.html`, chuyển trạng thái; tải lại trang để xác nhận trạng thái vẫn còn.
- Nếu trang trắng, kiểm tra DevTools → Network: request `/assets/config/supabase.json` và request `/rest/v1/...` phải trả mã 200.
- Kiểm tra thư mục `assets/images/menu` đã được upload đủ 24 ảnh; các request ảnh phải trả mã 200.
