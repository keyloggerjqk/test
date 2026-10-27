# Báo Cáo Sử Dụng AI & Nhật Ký Kiểm Thử Mã Nguồn (AI Usage Report)

> **Học phần:** Phát triển ứng dụng Web cơ bản – CSE122  
> **Dự án:** BTL-09 – MenuMind (Thực đơn thông minh & Điều phối đơn hàng F&B)  
> **Phiên bản:** V2.0 – Chuẩn hóa theo Tiêu chí 4.5 Barem Chấm điểm BTL (Phân định minh bạch 3 thành viên)  

---

## 1. Công Cụ & Phạm Vi Hỗ Trợ Của AI

* **Công cụ hỗ trợ:** Claude 3.5 Sonnet, ChatGPT-4o, GitHub Copilot.
* **Phạm vi hỗ trợ:** Gợi ý cấu trúc HTML5 ngữ nghĩa ban đầu, khung CSS Grid/Flexbox, thuật toán xử lý dữ liệu và kịch bản kiểm thử.
* **Cam kết của nhóm:** mã nguồn do AI gợi ý đã được từng thành viên trong nhóm trực tiếp đọc hiểu, kiểm tra bảo mật (chống XSS), đối soát với barem và tự tay chỉnh sửa lỗi trước khi commit lên nhánh Git cá nhân.

---

## 2. Bảng Đối Soát Ba Tính Năng AI Trên UI (Chuẩn 6 Bước & Failure UX)

| Thành viên sở hữu | Tính năng AI | (1) Input | (2) Processing | (3) Output | (4) Explainability | (5) User Control | (6) Save / Apply | (7) AI Failure / Uncertainty UX |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Trương Việt Hoàng (SV1)** | **AI-1: Taste Recommender**<br>*(Màn S03 - Thực đơn thông minh)* | Khẩu vị, món dị ứng, tâm trạng | Spinner / Loading 800ms | 3 gợi ý món + % phù hợp | Phân tích 3 yếu tố khẩu vị khớp | Chấp nhận / Sửa / Đổi món / Tạo lại | Thêm trực tiếp vào Giỏ món bàn ăn | Cảnh báo khi người dùng chưa chọn khẩu vị hoặc dữ liệu mâu thuẫn |
| **Đặng Xuân Dương (SV2)** | **AI-2: Kitchen Load Predictor**<br>*(Màn S09 - Cảnh báo thời gian chờ)* | Số đơn chờ, nhân sự bếp | Skeleton bếp tải | Dự báo thời gian chờ & tải bếp | Phân tích năng suất đơn/bếp | Áp dụng / Điều chỉnh / Bỏ qua / Dự báo lại | Lưu kế hoạch điều phối vào `localStorage` | Cảnh báo quá tải khi tỷ lệ vượt 8 đơn/đầu bếp |
| **Nguyễn Hoàng Hải (Leader - SV3)** | **AI-3: Feedback Theme Extractor**<br>*(Màn S14 - Trung tâm phản hồi)* | Nguồn đánh giá, mục tiêu cần phân tích | Hiệu ứng xoay Loading 800ms | 3 nhóm chủ đề + % tỷ lệ | Khối giải thích tần suất từ khóa & độ tin cậy 88% | Lưu insight / Chỉnh sửa / Tạo lại / Từ chối | Ghi nhận vào `localStorage` (`menumind:aiDecision`) | Cảnh báo độ tin cậy thấp (32%) khi mục tiêu dưới 10 ký tự kèm nút chip gợi ý |

---

## 3. Nhật Ký Chi Tiết Sử Dụng AI & Lịch Sử Tự Sửa Lỗi Của Từng Thành Viên

### 3.1. Trương Việt Hoàng (SV1 - Khối Mặt Tiền Thực Khách & AI-1)

| Màn hình & Task | Câu lệnh Prompt | Lỗi / Rủi ro do AI sinh ra | Cách Hoàng tự tay khắc phục |
| :--- | :--- | :--- | :--- |
| **S03:** Thực đơn thông minh<br>`TASK-03` | *"Viết hàm gợi ý món ăn theo sở thích khẩu vị khách hàng bằng AI."* | • AI luôn sinh kết quả ngay cả khi khách chưa chọn khẩu vị nào, **thiếu kịch bản AI Failure UX**.<br>• Nút "Chấp nhận món" chỉ hiện alert mà không cập nhật số lượng món vào Giỏ hàng. | • Bổ sung kiểm tra: Nếu khách chưa chọn tiêu chí, hiển thị hộp thoại vàng cảnh báo độ tin cậy thấp kèm gợi ý chọn vị cay/chay.<br>• Viết hàm cập nhật thật vào `menumind:cart` trong `localStorage` và bắn sự kiện cập nhật số lượng giỏ hàng trên Header. |
| **S05:** Giỏ món bàn ăn<br>`TASK-05` | *"Tạo trang giỏ hàng cho phép tăng giảm số lượng món và gửi đơn."* | • AI cho phép bấm nút "Gửi đơn" liên tục nhiều lần khi mạng chậm, **dễ gây tạo đơn trùng lặp ở bếp**.<br>• Khi giỏ hàng rỗng, giao diện để trống trơn không có hướng dẫn. | • Khóa nút gửi `button.disabled = true; button.textContent = 'Đang gửi bếp...'` ngay khi bấm.<br>• Bổ sung trạng thái Empty State có nút CTA **[ Khám phá thực đơn ]** điều hướng về S03. |

---

### 3.2. Đặng Xuân Dương (SV2 - Khối Vận Hành Bếp & AI-2)

| Màn hình & Task | Câu lệnh Prompt | Lỗi / Rủi ro do AI sinh ra | Cách Dương tự tay khắc phục |
| :--- | :--- | :--- | :--- |
| **S09:** Cảnh báo thời gian chờ<br>`TASK-09` | *"Viết thuật toán AI dự báo thời gian chờ của bếp dựa trên số đơn hàng."* | • AI tính thời gian chờ cố định (hardcode 15 phút), **không tính đến số lượng đầu bếp đang làm việc thực tế**.<br>• Thiếu kịch bản cảnh báo khi bếp bị quá tải nghiêm trọng. | • Lập trình công thức tính tải động: `loadIndex = totalItems / (cookCount * 3)`.<br>• Bổ sung kịch bản AI Overload/Failure UX: Khi tỷ lệ vượt quá 8 món/đầu bếp, hệ thống hiện cảnh báo đỏ rực yêu cầu điều phối thêm nhân sự. |
| **S07:** Bảng Kanban bếp<br>`TASK-07` | *"Tạo ra các ô chứa thông tin đơn hàng đang nấu , chờ phục vụ"* | • Khi bấm chuyển trạng thái đơn, AI chỉ đổi trên DOM tạm thời, **F5 lại trang thì đơn bị reset về trạng thái cũ**.<br>• Thiếu hiệu ứng Loading khi đơn hàng đang được cập nhật. | • Viết hàm đồng bộ hai chiều: Cập nhật trực tiếp vào mảng `orders` trong `localStorage` và gửi API Supabase.<br>• Bổ sung Spinner Loading và Toast thông báo khi chuyển trạng thái món. |

---

### 3.3. Nguyễn Hoàng Hải (Leader - SV3 - Khối Quản Trị, Cài Đặt & AI-3)

| Màn hình & Task | Câu lệnh Prompt | Lỗi / Rủi ro do AI sinh ra | Cách Hải tự tay khắc phục |
| :--- | :--- | :--- | :--- |
| **S14:** Trung tâm phản hồi<br>`TASK-14` | *"Tạo giao diện phân tích chủ đề nhận xét bằng AI đủ 6 bước theo barem."* | • Nhập 1-2 ký tự AI vẫn sinh kết quả, **hoàn toàn thiếu kịch bản AI Failure UX**.<br>• Nút "Lưu insight" chỉ dùng `alert()`, không lưu thật vào `localStorage`.<br>• Thẻ `<textarea>` đề xuất bị khóa `readonly`, người dùng không sửa được. | • Thêm điều kiện `if (goal.length < 10)` hiển thị cảnh báo vàng: *"Độ tin cậy thấp: 32%"* kèm các nút chip gợi ý.<br>• Thay `alert()` bằng hàm `setStore('aiDecision', ...)` lưu đối tượng thật vào `localStorage`.<br>• Cho phép người dùng chỉnh sửa trực tiếp nội dung đề xuất trước khi lưu. |

---

## 4. Minh Chứng Khắc Phục Lỗi Mã Nguồn Cụ Thể (Code Diff Thực Tế)


### Minh chứng : Bổ sung AI Failure / Uncertainty UX (Màn S14 - Hải SV3)
```javascript
// ❌ CODE AI SINH RA (LỖI: Luôn sinh kết quả dù nhập lung tung, thiếu Failure UX)
function runThemeAI(form) {
  const goal = new FormData(form).get('goal');
  el.innerHTML = '<p>Đang phân tích...</p>';
  setTimeout(() => {
    el.innerHTML = `<article><h3>3 chủ đề nổi bật</h3>...</article>`;
  }, 500);
}

// ✅ CODE SINH VIÊN TỰ SỬA LẠI (CHUẨN BAREM AI: Kiểm tra độ dài mục tiêu, Failure UX & Chip gợi ý)
function runThemeAI(form) {
  const goal = (new FormData(form).get('goal') || '').trim();
  
  // Kịch bản AI Failure / Uncertainty UX khi input < 10 ký tự
  if (goal.length < 10) {
    el.innerHTML = `
      <div class="ai-warning" role="alert">
        <span class="confidence low">Độ tin cậy thấp: <strong>32%</strong></span>
        <strong>Yêu cầu quá ngắn để AI phân tích chính xác</strong>
        <p>Mục tiêu phân tích cần ít nhất 10 ký tự. Vui lòng chọn gợi ý bên dưới:</p>
        <div class="prompt-chips">
          <button type="button" data-prompt="Tìm vấn đề phục vụ giờ cao điểm">Vấn đề phục vụ</button>
          <button type="button" data-prompt="Tìm món ăn cần cải thiện hương vị">Món cần cải thiện</button>
        </div>
      </div>`;
    return;
  }
  // Tiếp tục quy trình AI chuẩn...
}
```

---

## 5. Kết Luận & Bài Học Kinh Nghiệm Của Nhóm

1. **AI là trợ lý, con người là người quyết định:** AI giúp tăng tốc độ viết khung mã nguồn, nhưng các yêu cầu về trải nghiệm người dùng tinh tế (như Debounce chống giật lag, kiểm tra tính hợp lệ dữ liệu, chống gửi trùng lặp và kịch bản khi AI không chắc chắn) hoàn toàn phải do sinh viên tự tay thiết kế và lập trình.
2. **Nâng cao năng lực phản biện mã nguồn:** Quá trình đối soát và chỉnh sửa các lỗi do AI sinh ra đã giúp cả 3 thành viên hiểu sâu sắc về kiến trúc ứng dụng web, luồng dữ liệu hai chiều và sẵn sàng tự tin trả lời bất kỳ câu hỏi phản biện nào của hội đồng chấm thi.
