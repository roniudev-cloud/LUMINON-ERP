# Bảng Nghiệm Thu (Acceptance Checklist)

Khách hàng sử dụng bảng này để đánh dấu kiểm tra (Tick) sau mỗi chức năng được demo.

### 1. Đăng nhập & phân quyền
- [ ] Đăng nhập được bằng các tài khoản phân quyền (Admin, Sales, Kế toán...).
- [ ] Sidebar hiển thị đúng theo từng quyền (Sales không thấy menu Kho).
- [ ] User không có quyền không vào được trang nhạy cảm (VD: Kế toán gõ url `/settings` sẽ bị văng).
- [ ] Sales và Đội thi công không xem được chi phí, lợi nhuận ròng.

### 2. Dashboard
- [ ] Admin xem được biểu đồ Doanh thu tổng.
- [ ] Sales xem được doanh số cá nhân (Không thấy của người khác).
- [ ] Đội thi công nhìn thấy biểu đồ Công việc chưa làm.
- [ ] Dashboard responsive trên Mobile cực chuẩn.

### 3. CRM & Lead
- [ ] Tạo Lead, chuyển Lead thành Khách hàng.
- [ ] Ghi nhận Lịch sử chăm sóc (Activity Timeline).

### 4. Báo giá & Hợp đồng
- [ ] Thêm hạng mục báo giá, tự động tính tổng tiền + VAT.
- [ ] Chuyển Báo giá đã chốt thành Hợp đồng.
- [ ] Lập Tiến độ thanh toán trong Hợp đồng.
- [ ] Ký điện tử nền tảng (Lưu lại ảnh chữ ký).
- [ ] Hợp đồng chưa Ký không được chuyển thành Công trình.

### 5. Quản lý Công trình
- [ ] Giao công việc (Tasks) cho nhân viên Thi công.
- [ ] Thợ thi công dùng Mobile để upload ảnh Nghiệm thu lên phần Nhật ký.
- [ ] Thanh timeline (Gantt) hiển thị tiến độ Công trình.

### 6. Kế toán (Thu Chi & Công Nợ)
- [ ] Tạo Phiếu thu từ Hợp đồng -> Công nợ khách hàng tự động giảm.
- [ ] Tạo Phiếu chi mua vật tư -> Chi phí Công trình tự động tăng (Lợi nhuận giảm).
- [ ] Hiển thị màu đỏ cho các khoản Công nợ quá hạn.

### 7. Kho Vật Tư
- [ ] Nhập kho vật tư, tồn tăng.
- [ ] Xuất kho (Gắn với công trình cụ thể), tồn giảm. Cảnh báo lỗi nếu cố tình xuất quá số lượng tồn.
- [ ] Hiện cảnh báo Vật tư sắp hết (Dưới mức Min Stock).

### 8. Báo cáo & Settings
- [ ] Biểu đồ Bar Chart Doanh Thu / Lợi Nhuận hoạt động.
- [ ] Báo cáo tồn kho hiển thị chính xác.
- [ ] Upload thành công Logo Công ty trong phần Settings.
- [ ] Lưu lại các cấu hình Giao diện Dark/Light của cá nhân.
- [ ] Hệ thống Audit Logs lưu vết chính xác thao tác (Ai làm gì lúc nào).

---
**Khách Hàng (Ký & Ghi rõ họ tên):** ___________________________
**Đại Diện Kỹ Thuật (Ký & Ghi rõ họ tên):** _____________________
