# Hướng dẫn Cài đặt Supabase & Row Level Security (RLS)

LUMINON ERP sử dụng Supabase làm Database, Authentication và Storage. Việc cài đặt đúng là cực kỳ quan trọng để bảo vệ dữ liệu khách hàng.

## 1. Tạo Project Supabase
1. Đăng nhập [Supabase](https://supabase.com/).
2. Tạo Project mới, chọn Region gần Việt Nam nhất (Ví dụ: Singapore - `ap-southeast-1`).
3. Đặt Database Password an toàn và **lưu lại**.

## 2. Migration Database
Sau khi cấu hình `.env.local` kết nối với DB mới tạo, hãy chạy script Drizzle để đẩy Schema từ Code lên Supabase:
```bash
npm run db:push
```

## 3. Tạo Seed Data (Nếu cần)
Để có sẵn dữ liệu chạy thử:
```bash
npm run db:seed
```
*Cảnh báo: Không chạy Seed Data trên Production nếu bạn không muốn tạo dữ liệu giả rác DB thật.*

## 4. Cấu hình Storage Buckets
Vào phần **Storage** của Supabase, tạo các Buckets sau (Chữ thường, dấu gạch ngang):
1. `company-assets` (Public) - Chứa Logo, Chữ ký.
2. `user-avatars` (Public) - Chứa ảnh đại diện nhân viên.
3. `product-images` (Public) - Chứa ảnh sản phẩm.
4. `customer-files` (Private) - Chứa file của khách hàng.
5. `project-files` (Private) - Chứa bản vẽ, ảnh nghiệm thu thi công.
6. `finance-documents` (Private) - Chứa chứng từ phiếu thu/chi.
7. `contract-documents` (Private) - Chứa hợp đồng PDF/DOCX.
8. `template-files` (Private) - Chứa các mẫu Word/Excel.

## 5. Rà soát Row Level Security (RLS)
Để bật bảo mật RLS, bạn phải chạy SQL hoặc thao tác trên giao diện Supabase (Authentication > Policies) cho các bảng nhạy cảm:

- **Bảng `users`**:
  - `Select`: Mọi user đã login đều được đọc.
  - `Update`: User chỉ được phép sửa (Update) row có `id = auth.uid()`.
- **Bảng `audit_logs`**:
  - `Select`: Chỉ user có Role `Admin` mới được phép đọc.
  - `Insert`: App tự động ghi nhận (Dùng Service Role nên bỏ qua RLS).
- **Bảng `receipts`, `payments` (Tài chính)**:
  - `Select`: Chỉ user có Role `Admin` hoặc `Accountant` mới được xem. Sales và Thợ thi công bị chặn.
  
*Lưu ý: Drizzle ORM có thể sử dụng Service Role Key chạy bên trong Server Actions, do đó chúng ta check Permission ở tầng Code Application (App Router). Tuy nhiên việc bật RLS trên Supabase giúp tạo thêm 1 lớp rào chắn chống việc bị lộ key Anon.*

## 6. Cấu hình Site URL
Để luồng Login, Reset Password hoạt động đúng:
1. Vào Supabase **Authentication** > **URL Configuration**.
2. Tại **Site URL**, nhập Domain Production của Vercel (Ví dụ: `https://erp.luminon.vn`).
3. Xoá `http://localhost:3000` ra khỏi mục Redirect URLs nếu ở môi trường Production.
