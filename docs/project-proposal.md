# Đề Xuất Dự Án: MenuMind – Thực Đơn Thông Minh & Điều Phối Đơn Hàng

> **Học phần:** Phát triển ứng dụng Web cơ bản – CSE122  
> **Đề tài:** BTL-09 – MenuMind (Lĩnh vực: F&B / Nhà hàng - Ẩm thực)  
> **Nhóm thực hiện:** Nhóm 09 (3 sinh viên)  
> **Phiên bản tài liệu:** V2.0 – Chuẩn hóa theo Barem Chấm điểm & Quy chế Vấn đáp BTL CSE122  

---

## 1. Ngữ Cảnh Thực Tế & Câu Chuyện Lĩnh Vực (Domain Context)

Tại các nhà hàng F&B tầm trung và cao cấp, giờ cao điểm (trưa 11:30 – 13:30 và tối 18:30 – 20:30) luôn là thời điểm căng thẳng nhất trong chuỗi vận hành:
* **Khách hàng** bước vào bàn phải chờ phục vụ mang menu giấy ra; menu dài hàng chục món khiến khách băn khoăn mất 10–15 phút mới gọi xong món, nhân viên phải đứng đợi ghi chép thủ công.
* **Bếp** nhận order giấy viết tay dễ nhầm lẫn, không có thứ tự ưu tiên chuẩn xác, không biết món nào cần nấu gấp, dẫn đến tình trạng bàn đến trước nhận món sau.
* **Phục vụ** liên tục phải chạy vào bếp giục món khi khách phàn nàn, làm đứt gãy nhịp phục vụ tại sảnh.
* **Quản lý & Chủ nhà hàng** đến cuối ngày chỉ nhìn thấy con số tổng tiền trên phần mềm thu ngân, hoàn toàn mù mờ về các chỉ số cốt lõi: món nào ế khách, bàn nào phải đợi quá lâu, và khách hàng bức xúc điều gì về món ăn.

**MenuMind** ra đời như một giải pháp số hóa toàn diện tại bàn (QR Ordering & Dispatching Ecosystem): Khách tự khám phá thực đơn và gọi món $\rightarrow$ Đơn hàng đồng bộ tức thì vào bảng Kanban của Bếp $\rightarrow$ Quản lý theo dõi doanh số, điều phối món và tiếp nhận phản hồi thời gian thực qua sự hỗ trợ của các tính năng AI UX.

---

## 2. Phát Biểu Vấn Đề Cụ Thể (Problem Statements: P1 – P4)

* **P1. Khó khăn trong khám phá thực đơn (Menu Discovery Friction):**
  * *Đối tượng chịu ảnh hưởng:* Thực khách (Khách ăn).
  * *Chi tiết:* Khách bị "ngợp" trước danh sách món dài, không có công cụ tìm kiếm nhanh theo tên nguyên liệu, không lọc được theo khoảng giá hay phân loại món ăn (Khai vị, Món chính, Đồ uống, Tráng miệng).
* **P2. Thiếu cá nhân hóa theo sở thích & dinh dưỡng (Dietary & Taste Uncertainty):**
  * *Đối tượng chịu ảnh hưởng:* Thực khách.
  * *Chi tiết:* Khách ăn có chế độ ăn riêng biệt (kiêng cay, dị ứng hải sản, ăn chay, thích vị chua ngọt, ăn kiêng low-carb) nhưng menu truyền thống không thể tư vấn, dẫn đến việc gọi nhầm món không hợp khẩu vị và để lại trải nghiệm tồi tệ.
* **P3. Bất đồng bộ và đứt gãy trạng thái đơn hàng (Order State Desynchronization):**
  * *Đối tượng chịu ảnh hưởng:* Nhân viên Bếp và Nhân viên Phục vụ.
  * *Chi tiết:* Đơn hàng từ bàn ăn không được thông tin minh bạch; bếp nấu xong nhưng phục vụ không biết để bê ra; bàn chờ quá 20 phút không có cơ chế cảnh báo tự động khiến khách bức xúc bỏ về.
* **P4. Thiếu dữ liệu phân tích vận hành & Bỏ quên phản hồi khách hàng (Operational Blindspot & Feedback Silo):**
  * *Đối tượng chịu ảnh hưởng:* Quản lý ca và Chủ nhà hàng (Admin).
  * *Chi tiết:* Ý kiến đóng góp của khách hàng bị trôi mất hoặc chỉ nhận được khi khách đã đánh giá 1 sao trên mạng xã hội; quản lý không có báo cáo trực quan về món bán chạy/món tồn, không kịp thời cập nhật thực đơn khi hết nguyên liệu.

---

## 3. Mục Tiêu Dự Án (Project Objectives: O1 – O7)

* **O1. Xây dựng sản phẩm Web Frontend hoàn chỉnh:** Thiết kế nguyên mẫu Web ứng dụng Responsive đầy đủ từ Mobile (320px) đến Desktop ($\ge 1024$px), ngữ nghĩa chuẩn HTML5, CSS hiện đại và không có lỗi W3C.
* **O2. Phân rã 4 vai trò rõ nét (Multi-Role):** Xây dựng hành trình khép kín cho 4 nhóm người dùng thực tế: *Thực khách, Nhân viên Bếp, Quản lý nhà hàng, Quản trị viên (Chủ quán)*, kèm các trang dùng chung.
* **O3. CRUD và Quản lý vòng đời dữ liệu thực chất:** Thực hiện đầy đủ các thao tác Thêm, Đọc, Sửa, Xóa/Hủy/Ẩn/Vô hiệu hóa bản ghi gắn liền với logic kinh doanh F&B (không làm CRUD hình thức).
* **O4. DOM JavaScript & Kiểm tra hợp lệ sâu:** Tương tác DOM phong phú (Tìm kiếm thời gian thực kết hợp bộ lọc đa tiêu chí, Modal xác nhận, Toast thông báo, Form Validation chi tiết với thông báo lỗi đỏ dưới từng ô nhập).
* **O5. Quản lý trạng thái và lưu trữ bền vững:** Tích hợp mô-đun lưu trữ `localStorage` và dữ liệu mẫu phong phú ($\ge 24$ món ăn) để dữ liệu liên thông tức thì giữa các vai trò và không bị mất sau khi tải lại trang (F5).
* **O6. Thiết kế 3 trải nghiệm AI UX 6 bước & Failure UX:** Hiện thực hóa 3 tính năng AI đặc thù cho 3 đối tượng người dùng, tuân thủ nghiêm ngặt 6 bước tương tác UI và kịch bản xử lý khi AI không chắc chắn.
* **O7. Chuẩn hóa quy trình kỹ thuật & Làm việc nhóm:** Áp dụng Git Flow chuyên nghiệp (`main`, `dev`, `feature/*`), quản trị công việc trên Trello/Jira, thực hiện Peer Review và xây dựng bộ video OBS minh chứng 1:1 cho từng màn hình.

---

## 4. Danh Sách Thực Thể Dữ Liệu (Entities) & Ma Trận Vòng Đời Trạng Thái (Lifecycle State Matrix)

### 4.1. Danh sách thực thể dữ liệu cốt lõi

1. **`MenuItem` (Món ăn):**
   * *Thuộc tính:* `id`, `name`, `category` (Món chính, Khai vị, Đồ uống...), `price`, `image`, `description`, `tasteProfile` (cay, ngọt, chua, béo), `isVegetarian`, `status`.
2. **`Table` (Bàn ăn):**
   * *Thuộc tính:* `id`, `tableNumber`, `seats`, `floor`, `qrCode`, `currentOrderId`, `status`.
3. **`Order` (Đơn gọi món):**
   * *Thuộc tính:* `id`, `tableId`, `items` (mảng các món + số lượng + ghi chú), `totalAmount`, `createdAt`, `updatedAt`, `priorityLevel`, `status`, `paymentStatus`.
4. **`Feedback` (Đánh giá của khách):**
   * *Thuộc tính:* `id`, `orderId`, `tableId`, `rating` (1–5 sao), `comment`, `aiSentiment`, `aiThemes` (mảng nhãn chủ đề), `status`, `createdAt`.
5. **`Staff` (Tài khoản nhân sự):**
   * *Thuộc tính:* `id`, `fullName`, `email`, `role` (`kitchen`, `manager`, `admin`), `shift`, `status`.

---

### 4.2. Ma trận vòng đời trạng thái (State Lifecycle Matrix)

| Thực thể | Trạng thái khởi tạo | Các trạng thái trung gian | Trạng thái kết thúc | Hành động kích hoạt & Vai trò thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| **`MenuItem`** | `draft` (Nháp) | `available` (Đang mở bán) $\leftrightarrow$ `out_of_stock` (Hết hàng tạm thời) | `archived` (Ngừng kinh doanh) | Quản lý thêm mới $\rightarrow$ Bật/Tắt trạng thái bán $\rightarrow$ Xóa/Lưu trữ món |
| **`Table`** | `available` (Bàn trống) | `occupied` (Đang có khách ngồi) $\rightarrow$ `waiting_payment` (Chờ tính tiền) $\rightarrow$ `cleaning` (Đang dọn bàn) | `available` (Quay về vòng lặp) / `disabled` (Hỏng/Khóa) | Khách quét QR $\rightarrow$ Khách gọi tính tiền $\rightarrow$ Nhân viên dọn bàn $\rightarrow$ Sẵn sàng đón khách mới |
| **`Order`** | `pending` (Bếp vừa nhận) | `cooking` (Đầu bếp đang nấu) $\rightarrow$ `ready` (Món đã nấu xong, chờ bê ra) | `served` (Đã phục vụ xong) OR `cancelled` (Đã hủy món) | Khách gửi giỏ hàng $\rightarrow$ Bếp nhận nấu $\rightarrow$ Bếp báo xong $\rightarrow$ Thu ngân đóng bill |
| **`Feedback`** | `new` (Mới gửi) | `analyzed` (AI đã phân tích cảm xúc & gom chủ đề) $\rightarrow$ `processing` (Đang xử lý) | `resolved` (Đã ghi nhận & giải quyết) | Khách gửi sao $\rightarrow$ Hệ thống AI quét từ khóa $\rightarrow$ Quản lý phản hồi khách |
| **`Staff`** | `active` (Đang làm việc) | — | `inactive` (Tạm khóa / Vô hiệu hóa) | Quản trị viên cấp tài khoản $\rightarrow$ Vô hiệu hóa khi nghỉ việc |

---

## 5. Ba Trải Nghiệm AI Đặc Thù (Chuẩn AI Product UX 6 Bước & Failure UX)

Dự án tuyệt đối không sử dụng khung chat hỏi đáp generic, mà xây dựng 3 tính năng AI nhúng trực tiếp vào tác vụ của từng vai trò:

### 5.1. AI-1: Taste Recommender – Gợi Ý Món Ăn Theo Khẩu Vị (Vai trò: Thực khách)
* **Giải quyết vấn đề:** P1 & P2 (Khách băn khoăn khi xem menu dài, muốn ăn theo sở thích dinh dưỡng).
* **Giao diện tích hợp:** `pages/diner-menu.html`
* **Chuẩn 6 bước AI UX:**
  1. *Input:* Khách chọn tiêu chí nhanh qua các chip gợi ý: Mức cay (Không cay / Cay vừa / Cay nồng), Chế độ ăn (Ăn chay / Không gluten / Đậm đà / Thanh đạm), Ngân sách tối đa.
  2. *Processing:* Hiển thị thanh tiến trình / Skeleton Card phân tích khẩu vị khách hàng với dữ liệu thực đơn hiện tại.
  3. *Output:* Hiển thị Combo 2–3 món ăn kèm thẻ tóm tắt trực quan (Tên món, giá, độ phù hợp khẩu vị).
  4. *Explainability (Giải thích lý do):* Khối *"Vì sao AI gợi ý combo này?"* (Ví dụ: *"Khớp 95% với yêu cầu Không cay + Ăn chay; có đạm từ nấm và đậu hũ"*).
  5. *User Control (Quyền kiểm soát):* Nút *"Đổi món khác trong combo"*, *"Tạo lại gợi ý"* hoặc *"Bỏ qua"*.
  6. *Save / Apply:* Bấm *"Thêm cả combo vào giỏ hàng"* $\rightarrow$ Toàn bộ món ăn được thêm ngay vào giỏ món của bàn ăn.
* **Kịch bản AI Failure / Uncertainty UX:**
  * *Tình huống:* Khách chọn điều kiện mâu thuẫn (Ví dụ: *"Ăn chay"* nhưng lại tích *"Thịt bò hầm"* hoặc ngân sách quá thấp dưới giá món rẻ nhất).
  * *Xử lý UI:* Không báo lỗi hệ thống 500, mà hiển thị thông báo nhã nhặn: *"AI chưa tìm thấy món khớp 100% với các điều kiện trên (Độ tin cậy 35%)"* kèm nút bấm: *"Gợi ý điều chỉnh ngân sách"* hoặc *"Xem các món chay phổ biến nhất"*.

---

### 5.2. AI-2: Kitchen Load Predictor – Dự Báo Tải Bếp & Cảnh Báo Chờ Lâu (Vai trò: Nhân viên Bếp)
* **Giải quyết vấn đề:** P3 (Bếp quá tải dồn đơn, khách chờ lâu cáu gắt).
* **Giao diện tích hợp:** `pages/kitchen-wait-time-alerts.html`
* **Chuẩn 6 bước AI UX:**
  1. *Input:* Hệ thống tự động đọc số lượng đơn đang chờ trong hàng đợi (`queue`), số món nướng/xào/hấp đang nấu cùng lúc.
  2. *Processing:* Biểu tượng sóng nhịp bếp phân tích thời gian chế biến tiêu chuẩn của từng món.
  3. *Output:* Thẻ dự báo thời gian chờ ước tính cho từng bàn (Ví dụ: Bàn 04: dự kiến xong sau 8 phút; Bàn 09: có nguy cơ trễ 22 phút).
  4. *Explainability:* Giải thích: *"Bàn 09 gọi 3 món nướng phức tạp; lò nướng hiện đang full 100% công suất"*.
  5. *User Control:* Đầu bếp có các nút quyết định: *"Tăng ưu tiên đơn"*, *"Chuyển trạm bếp hỗ trợ"*, *"Thông báo phục vụ xin lỗi khách"*.
  6. *Save / Apply:* Khi bếp bấm *"Tăng ưu tiên"*, đơn hàng được gắn cờ thẻ đỏ trên bảng Kanban và đẩy lên đầu hàng đợi.
* **Kịch bản AI Failure / Uncertainty UX:**
  * *Tình huống:* Dữ liệu đơn hàng thiếu thời gian bắt đầu hoặc có món khách gọi ngoài menu chưa được đo chuẩn thời gian.
  * *Xử lý UI:* Hiển thị hộp cảnh báo màu vàng: *"AI chưa đủ dữ liệu đo lường cho món đặc biệt này – Vui lòng căn thời gian thủ công theo kinh nghiệm bếp trưởng"*.

---

### 5.3. AI-3: Feedback Theme Extractor – Trợ Lý Gom Nhóm & Phân Tích Chủ Đề Đánh Giá (Vai trò: Quản lý)
* **Giải quyết vấn đề:** P4 (Quản lý bận rộn không đọc xuể hàng trăm phản hồi của khách).
* **Giao diện tích hợp:** `pages/manager-feedback-center.html`
* **Chuẩn 6 bước AI UX:**
  1. *Input:* Quản lý chọn bộ lọc phản hồi trong tuần/tháng (ví dụ: các đánh giá từ 1 đến 3 sao).
  2. *Processing:* Hiển thị hiệu ứng quét ngôn ngữ (NLP Loading State).
  3. *Output:* Hiển thị thẻ tóm tắt 3 chủ đề nóng nhất: *#Nước_dùng_hơi_mặn (42%)*, *#Món_ra_chậm_giờ_trưa (35%)*, *#Thái_độ_phục_vụ_tốt (88%)*.
  4. *Explainability:* Liệt kê trích dẫn bằng chứng cụ thể: *"Trích từ 8 ý kiến khách hàng tại Bàn 02, Bàn 07 nhắc đến từ 'mặn', 'gắt cổ' trong 3 ngày qua"*.
  5. *User Control:* Nút *"Chỉnh sửa nhận xét của AI"*, *"Gửi chỉ đạo xuống Bếp trưởng"*, *"Lưu vào báo cáo tuần"*.
  6. *Save / Apply:* Bấm *"Lưu chỉ đạo"* $\rightarrow$ Cập nhật trực tiếp ghi chú nhắc nhở vào bảng điều khiển của Bếp.
* **Kịch bản AI Failure / Uncertainty UX:**
  * *Tình huống:* Khách chỉ đánh giá 1 sao nhưng không gõ chữ nhận xét nào, hoặc chỉ nhập các ký tự vô nghĩa (*"asdfgh"*).
  * *Xử lý UI:* Thẻ hiển thị: *"Đánh giá không chứa văn bản mô tả cụ thể. AI xếp vào nhóm 'Ý kiến chưa phân loại' – Khuyến nghị gọi điện chăm sóc khách hàng"*.

---

## 6. Sơ Đồ Cấu Trúc Trang & Luồng Nghiệp Vụ Đầu - Cuối

### 6.1. Sơ đồ trang web (Sitemap)

```text
[Trang chủ / Chọn bàn (index.html)]
  │
  ├──► [KHÁCH HÀNG]
  │      ├── Thực đơn & AI Gợi ý (pages/diner-menu.html)
  │      ├── Chi tiết món ăn (pages/diner-dish-detail.html)
  │      ├── Giỏ món bàn ăn & Gửi đơn (pages/diner-table-order.html)
  │      └── Theo dõi tiến độ & Đánh giá (pages/diner-order-status.html)
  │
  └──► [CỔNG NHÂN VIÊN] (pages/login.html)
         │
         ├──► [NHÂN VIÊN BẾP]
         │      ├── Bảng Kanban điều phối (pages/kitchen-board.html)
         │      ├── Chi tiết đơn chế biến (pages/kitchen-order-detail.html)
         │      └── Cảnh báo đơn trễ & AI Tải bếp (pages/kitchen-wait-time-alerts.html)
         │
         ├──► [QUẢN LÝ NHÀ HÀNG]
         │      ├── Quản lý thực đơn & giá (pages/manager-menu-management.html)
         │      ├── Yêu cầu thanh toán bàn (pages/manager-payment-requests.html)
         │      ├── Báo cáo doanh số & Xuất CSV (pages/admin-sales-insights.html)
         │      └── Phản hồi khách & AI Chủ đề (pages/manager-feedback-center.html)
         │
         └──► [QUẢN TRỊ VIÊN / CHỦ QUÁN]
                ├── Sơ đồ bàn & Mã QR bàn (pages/manager-table-management.html)
                ├── Quản lý tài khoản nhân viên (pages/admin-user-management.html)
                └── Cài đặt hệ thống nhà hàng (pages/admin-settings.html)
```

### 6.2. Luồng nghiệp vụ liên thông đa vai trò (End-to-End User Flow)

```text
[Thực khách tại Bàn 03]
   │ Quét QR bàn trên index.html
   ▼
Chọn món trên diner-menu.html (Dùng AI Taste Recommender)
   │ Thêm món vào giỏ trên diner-dish-detail.html
   ▼
Kiểm tra giỏ và Bấm "Gửi Bếp" trên diner-table-order.html
   │
   ├──────────────────────────────┐
   ▼                              ▼
[Màn hình Thực khách]          [Màn hình Bếp - kitchen-board.html]
Khách xem trạng thái đơn:       Đơn bàn 03 lập tức xuất hiện ở cột "Mới nhận"
"Đang chờ bếp nhận..."          Bếp bấm chuyển "Đang nấu"
   │                              │
   │ (Đồng bộ thời gian thực)      │ (Nếu nấu quá 15 phút)
   ▼                              ▼
Khách thấy đổi sang:           Màn hình kitchen-wait-time-alerts.html
"Bếp đang nấu món của bạn"      bật cảnh báo đỏ + AI dự báo tải
   │                              │
   │                              ▼
   │                           Bếp tick xong món → Chuyển sang "Đã xong"
   ▼                              │
Món được bê ra bàn                ▼
Khách ăn xong, bấm:            [Màn hình Quản lý - manager-payment-requests.html]
1. Đánh giá chất lượng sao     Xuất hiện yêu cầu thanh toán Bàn 03
2. Yêu cầu tính tiền           Quản lý xác nhận đã thu tiền → Bàn đổi về "Đang dọn"
   │                              │
   ▼                              ▼
Gửi feedback lên hệ thống      Doanh số cập nhật vào admin-sales-insights.html
AI Theme Extractor gom nhóm    Quản lý xem báo cáo & xuất CSV
trên feedback-center.html
```

---

## 7. Hệ Thống Thiết Kế (Design System & Tokens)

Hệ thống giao diện được định nghĩa nhất quán tại `css/common.css` và áp dụng cho toàn bộ 17 màn hình:

* **Màu mực chủ đạo (`#102A2B`):** Thể hiện sự sang trọng, tương phản cao trên nền sáng, dùng cho văn bản và typography.
* **Xanh ngọc thương hiệu (`#176B5B`):** Điểm nhấn nhận diện MenuMind, dùng cho các nút hành động chính (Primary CTA), trạng thái hoạt động (Active) và huy hiệu thành công (Success).
* **Vàng chanh / Xanh mạ (`#D9E7A6`):** Màu nhận diện vùng tính năng thông minh AI và nhịp thở vận hành (Service Pulse).
* **Cam ấm F&B (`#F1A33A`):** Tông màu kích thích vị giác, dùng cho hình ảnh món ăn, cảnh báo nhẹ (Warning) và độ ưu tiên đơn hàng.
* **Đỏ gạch (`#B94A3D`):** Dùng cho trạng thái lỗi (Error State), nút hủy đơn (Danger Action) và cảnh báo đơn trễ hạn.
* **Typography:** Tiêu đề dùng font *Manrope* (hiện đại, dứt khoát), nội dung hiển thị dùng font *Be Vietnam Pro* (tối ưu hiển thị tiếng Việt có dấu, sắc nét trên mọi kích thước màn hình).
