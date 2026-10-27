# Bảng Phân Công Nhiệm Vụ 2 Chiều (Team Assignment)

> **Học phần:** Phát triển ứng dụng Web cơ bản – CSE122  
> **Dự án:** BTL-09 – MenuMind (Thực đơn thông minh & Điều phối đơn hàng F&B)  
> **Nhóm thực hiện:** Nhóm 09 (Lớp 67KTPM2 – Khoa CNTT, Trường Đại học Thủy Lợi)  
> **Giảng viên hướng dẫn & chấm điểm:** ThS. Kiều Tuấn Dũng – ThS. Tạ Chí Hiếu  

---

## 1. Phân Công 2 Chiều (Vertical Slice + Trục Chéo) Cho 3 Thành Viên

Nhóm áp dụng mô hình phân chia công việc cân bằng theo tỷ lệ vàng **6 – 5 – 6**, kết hợp giữa Lát cắt dọc (Vertical Slice - phụ trách 100% UI & Logic theo Role) và Trục trách nhiệm chéo toàn hệ thống (Cross-Responsibility):

| Thành viên | Trách nhiệm dọc (Vertical Slice - Theo Role) | Trách nhiệm chéo (Cross-Responsibility - Toàn hệ thống) |
| :--- | :--- | :--- |
| **Trương Việt Hoàng (SV1)** | **Khối mặt tiền (6 màn):** S01 $\rightarrow$ S06<br>⭐ Phụ trách **AI-1: Taste Recommender** | **Trục chéo 1**: Kiểm thử Responsive đa thiết bị (320px, 768px, 1024px+), Thanh điều hướng chung (Navigation / Role Switcher), Khả năng tiếp cận (A11y) |
| **Đặng Xuân Dương (SV2)** | **Khối vận hành (5 màn):** S07 $\rightarrow$ S11<br>⭐ Phụ trách **AI-2: Kitchen Load Predictor** | **Trục chéo 2**: Xử lý dữ liệu (backend / localStorage / API), Dữ liệu mẫu JSON (15–25 bản ghi), Triển khai (Deploy) & QA |
| **Nguyễn Hoàng Hải (Leader - SV3)** | **Khối quản trị (6 màn):** S12 $\rightarrow$ S17<br>⭐ Phụ trách **AI-3: Feedback Theme Extractor** | **Trục chéo 3**: Hệ thống thiết kế (`css/common.css`, `css/style.css`, biến `:root`), Quản lý hợp nhất nhánh Git (`dev` $\rightarrow$ `main`) |

---

## 2. Chi Tiết Lát Cắt Dọc & Phân Bổ Màn Hình Từng Thành Viên

### 👤 SV1 — Trương Việt Hoàng: Khối Mặt tiền — Hành trình Thực khách (6 màn)
* **Logic nghiệp vụ:** Toàn bộ trải nghiệm của một người khách bước vào quán từ lúc quét QR, xem menu đến khi gửi đơn và theo dõi trạng thái món.
* **Danh sách màn hình (6 màn):**
  1. `index.html` — Trang chủ giới thiệu & Chọn bàn bắt đầu (`TASK-01` / `feature/index`)
  2. `pages/login.html` — Cổng đăng nhập nhân viên (`TASK-02` / `feature/login`)
  3. `pages/diner-menu.html` — Thực đơn tìm kiếm/lọc món (`TASK-03` / `feature/diner-menu`)
  4. `pages/diner-dish-detail.html` — Xem chi tiết món, chọn topping/ghi chú (`TASK-04` / `feature/diner-dish-detail`)
  5. `pages/diner-table-order.html` — Giỏ món bàn ăn, xem lại tiền & gửi đơn (`TASK-05` / `feature/diner-table-order`)
  6. `pages/diner-order-status.html` — Khách theo dõi tiến độ món ra & gửi phản hồi (`TASK-06` / `feature/diner-order-status`)
* **Tính năng AI phụ trách:** **AI-1 — Taste Recommender** (Gợi ý món ăn theo khẩu vị thực khách).
* **Trách nhiệm chéo toàn hệ thống (Trục chéo 1):** Kiểm thử Responsive đa thiết bị (320px, 768px, 1024px+), Thanh điều hướng chung (Navigation / Role Switcher), Khả năng tiếp cận (Accessibility Tab/Esc, `:focus-visible`, `alt`, `label`).

---

### 👨‍🍳 SV2 — Đặng Xuân Dương: Khối Vận hành — Điều phối Bếp & Phục vụ (5 màn)
* **Logic nghiệp vụ:** Toàn bộ công việc thực thi đơn hàng tại quán (Bếp nấu gì, bàn nào đang ngồi, bàn nào yêu cầu thanh toán bill).
* **Danh sách màn hình (5 màn):**
  1. `pages/kitchen-board.html` — Bảng Kanban điều phối món (Chờ $\rightarrow$ Nấu $\rightarrow$ Xong) (`TASK-07` / `feature/kitchen-board`)
  2. `pages/kitchen-order-detail.html` — Chi tiết từng đơn cần nấu, tick xong từng món (`TASK-08` / `feature/kitchen-order-detail`)
  3. `pages/kitchen-wait-time-alerts.html` — Cảnh báo đơn trễ thời gian chờ (`TASK-09` / `feature/kitchen-wait-time-alerts`)
  4. `pages/manager-table-management.html` — Quản lý trạng thái bàn (Trống / Có khách) & in QR bàn (`TASK-10` / `feature/manager-table-management`)
  5. `pages/manager-payment-requests.html` — Danh sách bàn yêu cầu thanh toán & xác nhận thu tiền (`TASK-11` / `feature/manager-payment-requests`)
* **Tính năng AI phụ trách:** **AI-2 — Kitchen Load Predictor** (Dự báo quá tải bếp và cảnh báo thời gian chờ).
* **Trách nhiệm chéo toàn hệ thống (Trục chéo 2):** Xử lý dữ liệu (backend / localStorage trong `js/database.js`, `js/api.js`), Bộ dữ liệu mẫu JSON 24 món ăn (`assets/data/app-data.json`), viết hàm dùng chung chống XSS `escapeHTML()`, Triển khai (Deploy) & QA.

---

### 💼 SV3 — Nguyễn Hoàng Hải (Leader): Khối Quản trị — Quản lý & Chủ nhà hàng (6 màn)
* **Logic nghiệp vụ:** Bộ não chiến lược của nhà hàng (quản lý món bán, xem doanh thu lời lỗ, xem đánh giá của khách, quản lý tài khoản nhân viên và cấu hình quán).
* **Danh sách màn hình (6 màn):**
  1. `pages/manager-menu-management.html` — CRUD quản lý món ăn, đổi giá, bật/tắt hết hàng (`TASK-12` / `feature/manager-menu-management`)
  2. `pages/admin-sales-insights.html` — Báo cáo doanh số bán chạy, biểu đồ & xuất CSV (`TASK-13` / `feature/admin-sales-insights`)
  3. `pages/manager-feedback-center.html` — Trung tâm tiếp nhận và xử lý đánh giá của khách (`TASK-14` / `feature/manager-feedback-center`)
  4. `pages/admin-user-management.html` — Quản lý tài khoản nhân viên (cấp quyền, vô hiệu hóa) (`TASK-15` / `feature/admin-user-management`)
  5. `pages/admin-settings.html` — Cài đặt thông tin nhà hàng, hotline, chế độ Sáng/Tối (`TASK-16` / `feature/admin-settings`)
  6. `pages/404.html` — Màn hình báo lỗi và phục hồi điều hướng hệ thống (`TASK-17` / `feature/404`)
* **Tính năng AI phụ trách:** **AI-3 — Feedback Theme Extractor** (Trợ lý AI phân tích và gom nhóm chủ đề phản hồi của khách).
* **Trách nhiệm chéo toàn hệ thống (Trục chéo 3):** Hệ thống thiết kế (`css/common.css`, `css/header.css`, biến `:root` màu sắc/typography), Quản lý kiến trúc nhánh Git (`dev` $\rightarrow$ `main`, PR Peer Review).
