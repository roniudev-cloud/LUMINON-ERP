# Xử lý sự cố (Troubleshooting)

## 1. Không Đăng nhập được
- **Nguyên nhân**: Mật khẩu sai, hoặc tài khoản đã bị Admin khóa (Inactive).
- **Cách xử lý**: Liên hệ Admin để vào `/settings/users` check lại trạng thái Active của account. Hiện tại chức năng "Quên mật khẩu" phụ thuộc vào cấu hình Email SMTP của Supabase.

## 2. Bị màn hình trắng báo lỗi "TypeError: Invalid URL" khi Build
- **Nguyên nhân**: Bạn đang cấu hình file `.env.local` bị sai URL Database, khiến Next.js không thể Pre-render trang.
- **Cách xử lý**: Kiểm tra lại biến `DATABASE_URL`. Phải dùng đúng định dạng Transaction Pooler (kết thúc bằng `/postgres` thay vì `?pgbouncer=true`).

## 3. Không thể Export PDF (Hoặc font chữ bị lỗi)
- **Nguyên nhân**: Thư viện `jspdf` chưa nhúng đúng Font Tiếng Việt (Roboto/Arial) nên các ký tự UTF-8 bị biến thành dấu `?`.
- **Cách xử lý**: Chờ bản update hỗ trợ nhúng `.ttf` base64 vào module PDF Export, hoặc dùng chức năng Print của Browser tạm thời.

## 4. Menu trên thanh Sidebar biến mất
- **Nguyên nhân**: Do Account của bạn không có Quyền (Permission) tương ứng. Hoặc Role của bạn vừa bị đổi.
- **Cách xử lý**: Chuyện này là bình thường. Nếu bạn là Sales mà không thấy menu Kho, tức là Admin đã không cấp quyền.

## 5. Báo cáo Doanh thu / Lợi nhuận không khớp
- **Nguyên nhân**: Báo cáo được query từ tổng các `Phiếu Thu` và `Phiếu Chi`. Nếu bạn tạo Phiếu Chi mà quên không gắn (Link) vào "Công trình A", hệ thống sẽ không biết chi phí đó thuộc công trình nào để trừ đi.
- **Cách xử lý**: Yêu cầu kế toán vào edit Phiếu Chi và chọn đúng Công trình tương ứng.
