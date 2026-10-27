# MenuMind – Thực Đơn Thông Minh & Điều Phối Đơn Hàng F&B

> **Học phần:** Phát triển ứng dụng Web cơ bản – CSE122  
> **Đề tài:** BTL-09 – MenuMind (Lĩnh vực: Nhà hàng / F&B)  
> **Giảng viên hướng dẫn & chấm điểm:** ThS. Kiều Tuấn Dũng – ThS. Tạ Chí Hiếu  
> **Nhóm thực hiện:** Nhóm 09 (Lớp 67KTPM2 – Khoa CNTT, Trường Đại học Thủy Lợi)  

---

## 👥 1. Thông Tin Nhóm & Phân Công Nhiệm Vụ 2 Chiều

Dự án áp dụng mô hình phân bổ công việc cân bằng **6 – 5 – 6** theo Lát cắt dọc (Vertical Slice) và Trách nhiệm chéo (Cross-Responsibility):

| Thành viên | Vai trò | Phụ trách khối nghiệp vụ (Lát cắt dọc) | Trách nhiệm chéo toàn hệ thống |
| :--- | :---: | :--- | :--- |
| **Trương Việt Hoàng** | Thành viên (SV1) | **Khối mặt tiền (6 màn):** S01 $\rightarrow$ S06<br>⭐ Phụ trách **AI-1: Taste Recommender** | **Trục chéo 1**: Kiểm thử Responsive đa thiết bị (320px, 768px, 1024px+),Khả năng tiếp cận (A11y) |
| **Đặng Xuân Dương** | Thành viên (SV2) | **Khối vận hành (5 màn):** S07 $\rightarrow$ S11<br>⭐ Phụ trách **AI-2: Kitchen Load Predictor** | **Trục chéo 2**: Xử lý dữ liệu (backend / localStorage / API), Dữ liệu mẫu JSON (15–25 bản ghi), Triển khai (Deploy) & QA |
| **Nguyễn Hoàng Hải** | **Trưởng nhóm (SV3)** | **Khối quản trị (6 màn):** S12 $\rightarrow$ S17<br>⭐ Phụ trách **AI-3: Feedback Theme Extractor** | **Trục chéo 3**: Hệ thống thiết kế (`css/common.css`, biến `:root`), Quản lý hợp nhất nhánh Git (`dev` $\rightarrow$ `main`) |

---

## 🌟 2. Giới Thiệu Tổng Quan Sản Phẩm

**MenuMind** là nguyên mẫu ứng dụng Web đa vai trò (Multi-Role Web Application) giải quyết bài toán vận hành nhà hàng hiện đại:
* 📱 **Thực khách (Diner):** Quét QR tại bàn, khám phá thực đơn, nhận tư vấn khẩu vị cá nhân hóa bằng AI, đặt món và theo dõi tiến độ ra món thời gian thực.
* 👨‍🍳 **Nhân viên Bếp (Kitchen):** Quản lý luồng chế biến trên bảng Kanban, cập nhật tiến độ nấu và nhận cảnh báo quá tải bếp từ AI.
* 💼 **Quản lý (Manager):** Kiểm soát thực đơn, xử lý yêu cầu thanh toán tại bàn, xem báo cáo doanh số và phân tích phản hồi khách hàng bằng AI.
* ⚙️ **Quản trị viên (Admin):** Quản lý sơ đồ bàn tiệc & mã QR, phân quyền tài khoản nhân viên và cấu hình thông số hệ thống.

---

## 🔗 3. Liên Kết Minh Chứng Dự Án

* 🌐 **Website chạy thử (Live Deployment):** `[Đang triển khai GitHub Pages / Vercel]`
* 📁 **Kho mã nguồn GitHub:** [https://github.com/coolnguyen/CSE122_67KTPM2_BTCK_Nhom9](https://github.com/coolnguyen/CSE122_67KTPM2_BTCK_Nhom9)
* 🎨 **Bản thiết kế Figma:** [https://www.figma.com/design/N8wER6qISetc5Gf4pANqka/MenuMind](https://www.figma.com/design/N8wER6qISetc5Gf4pANqka/MenuMind)
* 📋 **Bảng tiến độ Trello:** `[Dán liên kết Trello công khai tại đây]`
* 📹 **Thư mục Video OBS Minh chứng:** `[Dán liên kết Google Drive video 17 màn hình]`

---

## 📚 4. Mục Lục Tài Liệu Kỹ Thuật Chi Tiết (`docs/`)

Để đảm bảo tính tinh gọn, toàn bộ đặc tả chi tiết của dự án được tách thành các tài liệu chuyên sâu trong thư mục `docs/`:

1. 📄 **[Đặc tả Đề tài & Nghiệp vụ (project-proposal.md)](docs/project-proposal.md):** Phát biểu vấn đề (P1–P4), Mục tiêu (O1–O7), 5 Thực thể dữ liệu, Ma trận vòng đời trạng thái và Quy trình 3 tính năng AI.
2. 📋 **[Bảng Kiểm kê 17 Màn hình (screen-inventory.md)](docs/screen-inventory.md):** Bảng chuẩn hóa 12 cột theo Barem (CRUD, UI States, Phân công nhánh Git, Task ID, Video OBS).
3. 👥 **[Kế hoạch & Phân công Chi tiết (team-assignment.md)](docs/team-assignment.md):** Chi tiết phân công 2 chiều cho 3 thành viên Hoàng, Dương, Hải.
4. 🤖 **[Báo cáo Ứng dụng AI Frontend (ai-usage-report.md)](docs/ai-usage-report.md):** Kịch bản tương tác 6 bước, Prompt mẫu và Trải nghiệm xử lý khi AI thất bại (Failure UX).
5. 🚀 **[Hướng dẫn Triển khai (DEPLOY.md)](docs/DEPLOY.md):** Hướng dẫn chạy local, deploy GitHub Pages và kiểm thử tính tương thích đa trình duyệt.
6. 🗄️ **[Kiến trúc Cơ sở dữ liệu Supabase (supabase/SETUP.md)](supabase/SETUP.md):** Cấu trúc 12 tệp SQL migration, schema, seed data 24 món và phân quyền truy cập.

---

## ⚡ 5. Hướng Dẫn Chạy Thử Dự Án (Quick Start)

Dự án được xây dựng bằng **Vanilla HTML5, CSS3 và JavaScript ES6+** thuần túy, không yêu cầu cài đặt build tool phức tạp:

```bash
# 1. Clone kho mã nguồn về máy
git clone https://github.com/coolnguyen/CSE122_67KTPM2_BTCK_Nhom9.git

# 2. Di chuyển vào thư mục dự án
cd CSE122_67KTPM2_BTCK_Nhom9

# 3. Mở bằng Live Server trong VS Code (hoặc mở trực tiếp file index.html)
```

* 👉 Mở `index.html` trên trình duyệt để bắt đầu trải nghiệm với vai trò Thực khách.
* 👉 Sử dụng thanh **Role Switcher** ở góc phải thanh Header để chuyển đổi nhanh giữa 4 vai trò (Thực khách, Bếp, Quản lý, Admin).

---

## 🌳 6. Quy Trình Nhánh Git (Git Flow)

* `main`: Nhánh sản phẩm chính thức, ổn định, dùng để deploy chấm điểm bảo vệ.
* `dev`: Nhánh tích hợp chung của nhóm (mọi Pull Request đều merge vào đây).
* `feature/<task-id>-<screen-name>`: Nhánh làm việc độc lập của từng thành viên cho từng màn hình cụ thể.
