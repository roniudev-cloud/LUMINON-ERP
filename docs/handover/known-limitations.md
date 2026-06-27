# Giới Hạn Phiên Bản & Tính Năng Chờ Tích Hợp (Known Limitations)

Để đảm bảo tính minh bạch và kỳ vọng đúng đắn, dưới đây là danh sách những tính năng không nằm trong quy mô (Scope) của bản MVP v1.0, hoặc đang ở dạng "Mô hình" (Placeholder) cần có môi trường thật của Doanh nghiệp để kích hoạt.

## 1. Zalo OA & Facebook API (Omnichannel)
- **Hiện trạng**: Hệ thống ĐÃ CÓ các cổng nhận tín hiệu (Webhook) và giao diện Inbox đa kênh.
- **Giới hạn**: Để khách hàng chat trên Fanpage mà tin nhắn bay thẳng vào ERP, công ty bạn cần đăng ký App Developer với Meta/Zalo, xin xét duyệt và lấy Mã Token (Access Token) nhúng vào hệ thống. Việc này nằm ngoài scope của dự án Code.

## 2. Gửi Email & Push Notification
- **Hiện trạng**: Tính năng Thông báo In-App (Quả chuông trong web) chạy 100%. Các nút Switch bật tắt nhận Email đã có.
- **Giới hạn**: Chưa cấu hình Máy chủ gửi Email (SMTP như SendGrid, Amazon SES) và Máy chủ Gửi thông báo điện thoại (Firebase FCM). Chức năng Quên mật khẩu hiện đang bị Supabase Auth chặn do thiếu cấu hình SMTP này.

## 3. Xuất file DOCX tự động & Ký số Pháp lý
- **Hiện trạng**: Export PDF chạy tốt.
- **Giới hạn**: Việc lấy một Form Word (DOCX) có sẵn của Công ty và nhờ Code tự điền chữ vào chỗ trống là một bài toán cấu hình Server cực kỳ đắt đỏ. Phiên bản hiện tại chỉ xử lý ở mức "Lưu trữ mẫu văn bản". Chữ ký điện tử trên hệ thống cũng mang tính xác nhận nội bộ, chưa tích hợp với Cổng Ký Số VNPT/Viettel.

## 4. Mobile App Cài Đặt (Native App)
- **Hiện trạng**: LUMINON ERP là một Website tương thích tuyệt vời với di động (Mobile Responsive PWA).
- **Giới hạn**: Không có File cài đặt `.apk` hay App trên App Store. Đội thi công vẫn truy cập qua trình duyệt Safari/Chrome trên điện thoại.

## 5. Sao Lưu Tự Động (Auto Backup)
- **Giới hạn**: Dự án code không kiểm soát việc này. Bạn cần nâng cấp gói cước (Pro Plan) của nền tảng Database Supabase để họ tự động Snapshot backup dữ liệu mỗi ngày cho công ty. Mức phí do Supabase quy định.
