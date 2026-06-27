# Hướng dẫn Deploy LUMINON ERP lên Vercel

Tài liệu này hướng dẫn cách đưa mã nguồn LUMINON ERP lên nền tảng Vercel để chạy thực tế (Production).

## 1. Chuẩn bị (Prerequisites)
- Mã nguồn đã được đẩy lên Github.
- Đã hoàn tất cài đặt Database Supabase (Xem `supabase-setup.md`).
- Đã có tài khoản Vercel.

## 2. Các bước Deploy trên Vercel
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com).
2. Bấm nút **"Add New..."** > **"Project"**.
3. Import Repository Github chứa mã nguồn `luminon-erp`.
4. Trong phần cấu hình Project:
   - **Framework Preset**: Chọn `Next.js`.
   - **Root Directory**: Để mặc định (hoặc trỏ vào thư mục chứa package.json).
   - **Build Command**: Để mặc định (`npm run build`).

## 3. Cấu hình Environment Variables (Quan Trọng)
Trước khi bấm nút Deploy, bạn bắt buộc phải nhập các biến môi trường sau vào phần **Environment Variables** trên Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

*(Lấy các giá trị này từ Dashboard của Supabase, phần Settings > API và Settings > Database).*

## 4. Deploy & Kiểm tra
- Bấm **Deploy**. Vercel sẽ tiến hành cài đặt thư viện và chạy Build. Quá trình này mất khoảng 2-3 phút.
- Nếu bạn thấy lỗi `TypeError: Invalid URL` -> Điều này có nghĩa là biến `DATABASE_URL` bị sai hoặc Vercel không kết nối được tới Supabase khi thực hiện SSG (Static Site Generation).
- Sau khi Deploy thành công, bấm vào nút **Visit** để xem trang web thực tế.

## 5. Trỏ Tên Miền (Custom Domain)
1. Tại Vercel Project Dashboard, vào tab **Settings** > **Domains**.
2. Nhập tên miền của bạn (Ví dụ: `erp.luminon.vn`).
3. Vercel sẽ cung cấp một bản ghi DNS (CNAME hoặc A record).
4. Vào trang quản lý Domain của bạn (Mắt Bão, Tenten, Cloudflare) để thêm bản ghi tương ứng. Vercel sẽ tự động cấp SSL chứng chỉ bảo mật.
