# Bảng Kiểm Kê Màn Hình MenuMind (Screen Inventory)

> **Học phần:** Phát triển ứng dụng Web cơ bản – CSE122  
> **Dự án:** BTL-09 – MenuMind (Thực đơn thông minh & Điều phối đơn hàng F&B)  
> **Phiên bản:** V2.0 – Chuẩn hóa theo Barem Chấm điểm & Quy chế Vấn đáp BTL (Đủ 12 cột bắt buộc)  
> **Nguyên tắc:** Liệt kê đầy đủ 100% màn hình thực tế trong hệ thống, khớp 1:1 với thư mục `pages/` và tên nhánh Git.  

---

## 1. Bảng Kiểm Kê Chi Tiết 17 Màn Hình (Đủ 12 Cột Chuẩn Barem)

| ID | Role | User Goal (Mục tiêu) | User Task (Nhiệm vụ) | Screen (Tên màn hình) | File (Tệp HTML) | CRUD | States (Bao phủ trạng thái) | AI (Trải nghiệm AI) | Assignee (Phụ trách) | Task / Branch (Thẻ & Nhánh) | OBS (Video minh chứng) |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **S01** | Dùng chung | Bắt đầu đúng vị trí bàn | Quét QR / Chọn số bàn ăn | Giới thiệu & Chọn bàn | `index.html` | R/U | normal, disabled, selected | Không | **Trương Việt Hoàng (SV1)** | `TASK-01` / `feature/index` | PENDING |
| **S02** | Dùng chung | Vào đúng khu vực làm việc | Đăng nhập tài khoản nhân viên | Đăng nhập vai trò | `pages/login.html` | R | normal, validation, error | Không | **Trương Việt Hoàng (SV1)** | `TASK-02` / `feature/login` | PENDING |
| **S03** | Khách hàng | Khám phá thực đơn & nhận gợi ý | Tìm kiếm / Lọc món / Chọn AI | Thực đơn thông minh | `pages/diner-menu.html` | R/C cart | loading, normal, empty, AI failure | **AI-1: Taste Recommender** | **Trương Việt Hoàng (SV1)** | `TASK-03` / `feature/diner-menu` | PENDING |
| **S04** | Khách hàng | Hiểu rõ thành phần & tùy biến | Chọn số lượng / Ghi chú món | Chi tiết món ăn | `pages/diner-dish-detail.html` | C/R/U cart | normal, validation, success | Không | **Trương Việt Hoàng (SV1)** | `TASK-04` / `feature/diner-dish-detail` | PENDING |
| **S05** | Khách hàng | Kiểm tra giỏ hàng trước khi gửi | Sửa số lượng / Xóa / Gửi đơn | Giỏ món bàn ăn | `pages/diner-table-order.html` | C/R/U/D | normal, empty, disabled, success | Không | **Trương Việt Hoàng (SV1)** | `TASK-05` / `feature/diner-table-order` | PENDING |
| **S06** | Khách hàng | Nắm bắt tiến độ & phản hồi | Theo dõi món / Đánh giá / Tính tiền | Theo dõi đơn hàng | `pages/diner-order-status.html` | R/C feedback | loading, pending, served, success | Không | **Trương Việt Hoàng (SV1)** | `TASK-06` / `feature/diner-order-status` | PENDING |
| **S07** | Nhân viên bếp | Điều phối chế biến liên tục | Nhận đơn / Đổi trạng thái nấu | Bảng Kanban bếp | `pages/kitchen-board.html` | R/U order | loading, normal, empty, error, success | Không | **Đặng Xuân Dương (SV2)** | `TASK-07` / `feature/kitchen-board` | PENDING |
| **S08** | Nhân viên bếp | Kiểm tra chi tiết đơn hàng | Tick món xong / Ưu tiên đơn | Chi tiết đơn chế biến | `pages/kitchen-order-detail.html` | C/R/U | normal, pending, completed, cancelled | Không | **Đặng Xuân Dương (SV2)** | `TASK-08` / `feature/kitchen-order-detail` | PENDING |
| **S09** | Nhân viên bếp | Kiểm soát rủi ro trễ món | Lọc đơn trễ / Dự báo tải bếp | Cảnh báo thời gian chờ | `pages/kitchen-wait-time-alerts.html` | C/R/U | normal, empty, loading, AI failure | **AI-2: Kitchen Load Predictor** | **Đặng Xuân Dương (SV2)** | `TASK-09` / `feature/kitchen-wait-time-alerts` | PENDING |
| **S10** | Vận hành sảnh | Quản lý sơ đồ bàn tiệc | Tạo bàn mới / In mã QR bàn | Quản lý bàn ăn & QR | `pages/manager-table-management.html` | C/R/U | normal, validation, success | Không | **Đặng Xuân Dương (SV2)** | `TASK-10` / `feature/manager-table-management` | PENDING |
| **S11** | Vận hành sảnh | Thu ngân & Xác nhận hóa đơn | Xem bàn chờ tính tiền / Thu tiền | Yêu cầu thanh toán tại bàn | `pages/manager-payment-requests.html` | R/U | normal, empty, success | Không | **Đặng Xuân Dương (SV2)** | `TASK-11` / `feature/manager-payment-requests` | PENDING |
| **S12** | Quản lý | Kiểm soát thực đơn nhà hàng | Thêm món / Đổi giá / Bật tắt hết | Quản lý thực đơn | `pages/manager-menu-management.html` | C/R/U/Archive | normal, empty, validation, success | Không | **Nguyễn Hoàng Hải (SV3 - Leader)** | `TASK-12` / `feature/manager-menu-management` | PENDING |
| **S13** | Quản lý | Đo lường hiệu quả kinh doanh | Lọc thời gian / Doanh số / CSV | Báo cáo doanh số & Thống kê | `pages/admin-sales-insights.html` | R/Export | normal, success, empty | Không | **Nguyễn Hoàng Hải (SV3 - Leader)** | `TASK-13` / `feature/admin-sales-insights` | PENDING |
| **S14** | Quản lý | Cải thiện chất lượng dịch vụ | Đọc nhận xét / AI phân nhóm chủ đề | Trung tâm phản hồi khách | `pages/manager-feedback-center.html` | R/U | normal, loading, success, AI failure | **AI-3: Feedback Theme Extractor** | **Nguyễn Hoàng Hải (SV3 - Leader)** | `TASK-14` / `feature/manager-feedback-center` | PENDING |
| **S15** | Quản trị viên | Kiểm soát phân quyền nhân sự | Tạo tài khoản / Khóa tài khoản | Quản lý tài khoản nhân viên | `pages/admin-user-management.html` | C/R/U/Disable | normal, validation, success | Không | **Nguyễn Hoàng Hải (SV3 - Leader)** | `TASK-15` / `feature/admin-user-management` | PENDING |
| **S16** | Quản trị viên | Cấu hình tham số toàn hệ thống | Đổi thông tin quán / Giờ trễ / Theme | Cài đặt hệ thống nhà hàng | `pages/admin-settings.html` | R/U/D reset | normal, validation, success, danger | Không | **Nguyễn Hoàng Hải (SV3 - Leader)** | `TASK-16` / `feature/admin-settings` | PENDING |
| **S17** | Dùng chung | Phục hồi trải nghiệm khi sai URL | Tìm kiếm món / Quay về trang chủ | Trang 404 & Phục hồi | `pages/404.html` | R | error, recovery | Không | **Nguyễn Hoàng Hải (SV3 - Leader)** | `TASK-17` / `feature/404` | PENDING |

---

## 2. Quy Chuẩn Đặt Tên Tệp HTML & Tính Nhất Quán (Tiêu chí 2.4 Barem)

* **100% tuân thủ quy tắc:** Viết thường, tiếng Anh, nối nhau bằng dấu gạch ngang (`kebab-case`), không có dấu tiếng Việt, không viết tắt vô nghĩa kiểu `trang1.html`, `quanly.html`.
* **Cấu trúc đặt tên chuẩn:** `role-function-action.html`
  * `diner-*`: Phục vụ vai trò Thực khách (Menu, Chi tiết món, Giỏ hàng, Theo dõi đơn).
  * `kitchen-*`: Phục vụ vai trò Nhân viên Bếp (Bảng Kanban, Chi tiết đơn, Cảnh báo tải).
  * `manager-*`: Phục vụ vai trò Quản lý ca & Thu ngân (Thực đơn, Bán hàng, Phản hồi, Thanh toán).
  * `admin-*`: Phục vụ vai trò Quản trị viên cấp cao (Sơ đồ bàn, Tài khoản, Cài đặt).
* **Tính liên thông 0 liên kết chết (Dead Link):** Toàn bộ các thẻ điều hướng, Role Switcher và nút chuyển trang đều liên kết chính xác tuyệt đối đến 17 tệp HTML trên.

---

## 3. Thống Kê Phân Bổ Công Việc Cân Bằng (Tỷ Lệ Vàng 6 – 5 – 6)

| Thành viên | Khối nghiệp vụ phụ trách (Lát cắt dọc) | Số màn hình | Tính năng AI sở hữu | Trách nhiệm chéo toàn hệ thống (Cross-Responsibility) |
| :---: | :--- | :---: | :---: | :--- |
| **Trương Việt Hoàng (SV1)** | **Khối mặt tiền (Hành trình Thực khách)** | **6 màn** (S01 – S06) | **AI-1: Taste Recommender** | **Trục chéo 1**: Kiểm thử Responsive đa thiết bị (320px, 768px, 1024px+), Thanh điều hướng chung (Navigation / Role Switcher), Khả năng tiếp cận (A11y) |
| **Đặng Xuân Dương (SV2)** | **Khối vận hành (Điều phối Bếp & Sảnh bàn)** | **5 màn** (S07 – S11) | **AI-2: Kitchen Load Predictor** | **Trục chéo 2**: Xử lý dữ liệu (backend / localStorage / API), Dữ liệu mẫu JSON (15–25 bản ghi), Triển khai (Deploy) & QA |
| **Nguyễn Hoàng Hải (Leader - SV3)** | **Khối quản trị (Quản lý kinh doanh & Admin)** | **6 màn** (S12 – S17) | **AI-3: Feedback Theme Extractor** | **Trục chéo 3**: Hệ thống thiết kế (`css/common.css`, biến `:root`), Quản lý hợp nhất nhánh Git (`dev` $\rightarrow$ `main`) |

> 📌 **Lưu ý trước giờ bảo vệ:** Cột **OBS** sẽ được cập nhật link video thực tế sau khi từng thành viên hoàn thành video quay màn hình độc lập có webcam rõ khuôn mặt theo đúng quy chế.
