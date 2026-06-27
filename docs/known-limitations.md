# Các Hạn Chế và Tính năng Chờ tích hợp (Known Limitations)

Là một phiên bản v1.0, LUMINON ERP cung cấp bộ khung (Core Framework) quản trị đồ sộ. Tuy nhiên, có một số tính năng đang ở trạng thái Placeholder (Đã có UI giao diện, có chuẩn bị cấu trúc Database, nhưng chưa móc API bên thứ 3) do cần có tài khoản Doanh nghiệp hoặc Cấu hình hạ tầng chuyên biệt.

Vui lòng đọc kỹ danh sách dưới đây trước khi bàn giao cho Khách hàng:

## 1. Omnichannel (Facebook / Zalo)
- **Tình trạng hiện tại**: Đã có màn hình `/omnichannel/inbox` và các luồng API nhận Webhook tại `src/app/api/webhooks/zalo/route.ts`.
- **Hạn chế**: Chưa nối Access Token thật của Facebook Fanpage và Zalo OA vì cần tạo App từ phía khách hàng và Verify doanh nghiệp. Chức năng nhắn tin lại cho khách chưa hoạt động.

## 2. Notification (Email & Push Notification)
- **Tình trạng hiện tại**: Hệ thống thông báo In-App (Cái chuông trên Web) đã hoạt động tốt 100%. User Preferences bật tắt đã lưu vào DB.
- **Hạn chế**: Chưa tích hợp dịch vụ gửi Email (Ví dụ: Resend, SendGrid) hay Push Noti trên Mobile (Ví dụ: Firebase FCM). Đây là các Placeholder.

## 3. Quên mật khẩu & Đổi mật khẩu
- **Tình trạng hiện tại**: Màn hình `profile/security` đã có. Tuy nhiên Supabase Auth chặn việc user đổi mật khẩu trực tiếp qua API nếu không có cơ chế gửi Email Verify (SMTP).
- **Hạn chế**: Hiện tại chỉ Admin mới có thể vào màn hình quản lý User của Supabase để Reset thủ công mật khẩu cho nhân viên.

## 4. Export DOCX & Excel Phức tạp
- **Tình trạng hiện tại**: PDF Export đã có thư viện.
- **Hạn chế**: DOCX Template Replacement (Điền dữ liệu vào file Word mẫu) là một chức năng cực kỳ phức tạp trên môi trường Web Serverless. Thư viện hiện tại mới chỉ dựng Mock Services. Cần build riêng 1 Micro-service hoặc dùng API DocSpring để chạy mượt.

## 5. Môi trường Mobile App (Native App)
- **Tình trạng hiện tại**: LUMINON ERP là một PWA (Progressive Web App). Responsive cực tốt trên điện thoại.
- **Hạn chế**: Chưa có bản App cài đặt từ App Store (iOS) / Google Play (Android). Đội thi công vẫn cần truy cập bằng trình duyệt Safari/Chrome. Mặc dù giao diện thân thiện, nhưng không có thông báo rung (Native Push Noti).
