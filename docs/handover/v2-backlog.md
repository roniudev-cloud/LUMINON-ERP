# Lộ trình Nâng Cấp V2 (V2 Backlog)

Sau khi Doanh nghiệp làm quen với LUMINON ERP v1.0 khoảng 2-3 tháng, chúng tôi đề xuất mở khóa sức mạnh thực sự của việc Số hoá thông qua các Gói Nâng cấp (Upsell) ở Phase V2.

## Ưu tiên 1: Kết Nối Khách Hàng (Customer Connection)
- **Tích hợp Zalo ZNS**: Gửi tin nhắn tự động từ ERP sang Zalo khách hàng mỗi khi Báo giá được chốt, hoặc khi công trình vừa hoàn thành.
- **Bật kênh Omnichannel**: Nối Token Facebook/Zalo OA thật. Sales chỉ cần ngồi trên ERP để chat với khách ở mọi nền tảng mà không cần dùng nick cá nhân.
- **Cấu hình Email SMTP server**: Bật chức năng tự động Gửi Email Hợp đồng dạng PDF sang thẳng hòm thư khách hàng.

## Ưu tiên 2: Tự Động Hoá Vận Hành (Automation)
- **Tự động chia Lead (Round-Robin)**: Lead từ Web đổ về sẽ tự động chia đều cho các bạn Sales đang online, không cần Giám đốc chia tay.
- **Hệ thống Cảnh báo tự động**: Đặt Rule (Quy tắc): Nếu công trình chậm deadline 3 ngày, tự bắn cảnh báo đỏ về Dashboard của Quản đốc. Chi phí vượt 90% dự toán -> Khoá không cho Kế toán tạo thêm Phiếu Chi.
- **Tự động nhắc Công nợ**: Đến ngày 15 hàng tháng, phần mềm tự lôi những Khách hàng nợ quá hạn vào một danh sách và đẩy Notification cho Sales đi đòi.

## Ưu tiên 3: Hiện Đại Hoá Đội Thi Công (Field Operations)
- **App Native cho Thợ Thi Công**: Build một ứng dụng thật trên App Store (React Native). Giúp thợ nhận thông báo Rung (Push Notification).
- **Check-in GPS**: Thợ thi công đến tận nhà khách hàng bấm nút Check-in, lấy định vị GPS và giờ giấc để tính công xảo.

## Ưu tiên 4: Ứng Dụng Trí Tuệ Nhân Tạo (AI Features)
- **AI Tóm tắt Hội thoại**: Ứng dụng AI đọc hàng trăm dòng note chăm sóc khách hàng và tóm tắt thành 1 câu cho Quản lý đọc lướt.
- **AI Đọc Báo Giá (OCR)**: Khách hàng quăng một file báo giá của Đối thủ vào (PDF). AI tự đọc bóc tách hạng mục và điền thẳng vào form ERP của chúng ta.
- **AI Chăm Sóc Khách (Chatbot)**: Gắn trên Website, khách hỏi giá Tủ Bếp, AI tự chui vào CSDL ERP lấy giá của vật tư MDF gửi ra cho khách.
