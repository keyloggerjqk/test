# Vai trò và chức năng

| Vai trò | Mục tiêu | Chức năng | Dữ liệu tác động |
|---|---|---|---|
| Khách hàng | Chọn và nhận món đúng nhu cầu | Search/filter/sort, tùy chỉnh, giỏ món, tạo đơn, theo dõi, đánh giá, AI khẩu vị | cart, orders, feedback |
| Nhân viên bếp | Điều phối đơn rõ ràng | Kanban trạng thái, checklist món, ưu tiên, cảnh báo trễ, AI dự báo tải | orders, aiDecision |
| Quản lý | Cải thiện menu và vận hành | Tạo/ẩn món, thống kê, CSV, xử lý feedback, AI nhóm chủ đề | menuItems, feedback, aiDecision |
| Quản trị viên | Quản trị nguồn lực hệ thống | Tạo/cập nhật bàn, tạo/vô hiệu tài khoản, cấu hình | tables, staff, settings |

## Ba trải nghiệm AI

1. Taste Recommender giải quyết P1/P2 và có thể thêm kết quả vào giỏ.
2. Kitchen Load Predictor giải quyết P3 và lưu kế hoạch điều phối.
3. Feedback Theme Extractor giải quyết P4 và lưu insight sau khi quản lý sửa/chấp nhận.

Mỗi luồng có loading, kết quả, độ tin cậy/yếu tố giải thích, nút chấp nhận hoặc lưu, sửa, từ chối, tạo lại. Kịch bản thiếu dữ liệu và tải bếp quá mức là Failure/Uncertainty UX.

