# Danh Sách Chức Năng Đã Hoàn Thành (Completed Features)

Dưới đây là thống kê khối lượng công việc khổng lồ đã được nghiệm thu trong MVP.

## 1. Authentication & Phân Quyền (RBAC) - [Hoàn thành]
- Cơ chế Login / Phân quyền bảo mật cao bằng Row Level Security của Supabase.
- Tích hợp 5 Role gốc: Admin, Sales, Accountant, Production, Warehouse.
- Bảo mật UI: Cấm render màn hình và API theo Role (Server Actions Protection).

## 2. Quản Trị Khách Hàng (CRM) - [Hoàn thành]
- Màn hình quản lý Lead & Customers.
- Convert từ Lead sang Khách hàng chính thức.
- Ghi chú quá trình chăm sóc khách (Timeline).

## 3. Bán Hàng & Hợp Đồng - [Hoàn thành]
- Tạo Báo Giá nhiều hạng mục (Tự tính VAT, Thành tiền).
- Đổi trạng thái Báo Giá, sinh Hợp Đồng tự động.
- Tạo form Hợp Đồng, Quản lý tiến độ thanh toán (Các đợt thu tiền).
- Upload và hiển thị chữ ký/con dấu điện tử gốc.

## 4. Quản lý Sản xuất & Công Trình - [Hoàn thành]
- Tạo Công Trình từ Hợp Đồng.
- Cập nhật tiến độ % Công Trình.
- Chia nhỏ Việc Thi công (Tasks) và Giao cho Đội thợ.
- Nhật ký thi công: Nơi chụp ảnh tiến độ và bàn luận.

## 5. Tài Chính & Kế Toán (Thu Chi) - [Hoàn thành]
- Tạo Phiếu Thu (Nhận tiền từ Khách). Tự động link tới Hợp đồng và trừ Công nợ Khách.
- Tạo Phiếu Chi (Mua hàng hoá, xuất quỹ). Tự động link tới Công trình để tính Chi phí dự án.
- Cảnh báo Công nợ sắp hạn / quá hạn.

## 6. Kho Vật Tư - [Hoàn thành]
- Danh mục Vật Tư (Gỗ, Sắt, Phụ kiện) & Nhà Cung Cấp.
- Lập phiếu Nhập Kho (Tăng tồn), Phiếu Xuất Kho (Giảm tồn).
- Cảnh báo Tồn kho tối thiểu (Min Stock).

## 7. Báo Cáo Thống Kê (Dashboard) - [Hoàn thành]
- Biểu đồ Bar Chart Doanh Thu, Chi Phí.
- Bảng Lợi Nhuận ròng theo từng Công trình (Rất quan trọng cho Giám đốc).
- Xuất tài liệu File PDF chuyên nghiệp (Ví dụ: Export Báo Giá sang PDF).

## 8. Bán Hàng Online & Tiện Ích - [Hoàn thành cơ bản]
- Quản lý Sản phẩm bán lẻ, Sinh biến thể. Đơn hàng từ Web đẩy về ERP.
- Tính năng Nhắc việc (Reminders), Lịch (Calendar).
- Thông báo In-App (Notifications) và Nhật ký thao tác (Audit Logs).
- Tuỳ chỉnh Preferences: Cấu hình Dark/Light Mode.

## 9. Omnichannel Nền Tảng - [Placeholder]
- Đã dựng sẵn UI Gom tin nhắn (Inbox). Đã dựng sẵn Server API nhận tín hiệu (Webhook) từ Facebook/Zalo OA. (Cần API Key thực tế của doanh nghiệp để chạy thật).
