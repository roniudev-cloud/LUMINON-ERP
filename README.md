# LUMINON ERP

Hệ thống quản trị doanh nghiệp toàn diện dành cho các công ty thi công nội thất và quảng cáo.

## Công nghệ sử dụng
- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security)
- **ORM**: Drizzle ORM
- **UI Components**: Shadcn UI (Tailwind CSS, Radix UI)
- **Forms**: React Hook Form, Zod

## Cấu trúc thư mục
- `/src/app`: Chứa tất cả các routes của Next.js (Dashboard, Auth, Settings, Profile...)
- `/src/components`: Các UI Components dùng chung (Shared) và của Shadcn.
- `/src/features`: Chia nhỏ code theo từng module (CRM, Finance, Inventory, Projects...). Mỗi folder feature sẽ chứa components riêng biệt cho feature đó.
- `/src/lib`: Constants, Utilities, Formatters.
- `/src/actions`: Server Actions để xử lý Data Mutation (Cập nhật DB) bảo mật thay cho API truyền thống.
- `/drizzle`: Định nghĩa Database Schema (`schema/auth.ts`, `schema/crm.ts`...)

## Hướng dẫn cài đặt

1. **Clone repo và cài thư viện:**
```bash
npm install
# hoặc pnpm install
```

2. **Cấu hình Supabase & Database:**
- Copy file `.env.example` thành `.env.local`.
- Tạo project mới trên Supabase.
- Lấy thông tin nhúng vào `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Chỉ dùng phía Server, tuyệt đối không lộ lên Client)
  - `DATABASE_URL` (Connection pooling URL)

3. **Đẩy Database Schema (Migration):**
```bash
npm run db:push
```

4. **Đổ dữ liệu mẫu (Seed Data):**
```bash
npm run db:seed
```
*Lưu ý: Bạn phải tạo Auth Users trực tiếp trong Supabase Dashboard (Ví dụ: admin@luminon.vn).*

5. **Chạy Local:**
```bash
npm run dev
```

6. **Build Production:**
```bash
# Sẽ check type và compile
npm run build
```

## Các tính năng còn là Placeholder
Do giới hạn của thời gian Demo và cần tài khoản Partner, các chức năng sau chỉ dựng luồng (UI/Flow) và chưa móc API thật:
- **Tích hợp Zalo OA / Facebook Fanpage API**: Webhook đã viết sẵn ở `/api/webhooks`, UI Omnichannel đã có, nhưng chưa nối Token thật.
- **Push Notifications / Email**: Đã có UI bật/tắt nhưng chưa tích hợp SendGrid / Firebase.
- **Export DOCX**: Đang ở mức xử lý File cơ bản.
- **Đổi mật khẩu trong App**: Supabase yêu cầu flow gửi Email Reset, nút "Đổi mật khẩu" ở `/profile/security` đang bị disabled.

## Phân quyền & Tài khoản Demo

Hệ thống cung cấp RBAC rất sâu. Khi demo, hãy tạo các User trên Supabase và gán Role vào bảng `user_roles` (Dùng ID từ bảng `roles`).
- **Admin**: Nhìn thấy Lợi nhuận công trình, Audit Logs, Settings hệ thống.
- **Sales**: Chỉ thấy Báo giá, Khách hàng, không thấy Lợi nhuận và Thu/Chi nội bộ.
- **Thợ thi công**: Chỉ vào được Công trình để xem việc, đăng ảnh Nhật ký, không thấy Tiền bạc.
