# LUMINON ERP - Checklist Trước khi Bàn giao (Pre-handover)

Sử dụng bảng kiểm này để đảm bảo Hệ thống đạt 100% tiêu chuẩn trước khi đưa cho User cuối nghiệm thu.

## 1. Môi trường & Hệ thống (Infrastructure)
- [ ] Vercel Deploy xanh (Thành công), không báo lỗi Build.
- [ ] Truy cập được Domain Production (VD: `https://erp.luminon.vn`).
- [ ] Database URL trong Vercel Environment kết nối đúng Supabase Transaction Pooler.
- [ ] Đã tắt toàn bộ `console.log` debug chứa thông tin nhạy cảm.

## 2. Supabase Configuration
- [ ] Đã chạy `drizzle-kit push` để sync Migration.
- [ ] Đã Setup đúng Site URL và Redirect URL trong Authentication Settings.
- [ ] Đã chạy Seed Data Production (Hoặc đã tạo Admin account thủ công).
- [ ] Row Level Security (RLS) đã bật trên ít nhất các bảng Tài chính, Users.
- [ ] Đã tạo đủ 8 Storage Buckets theo chuẩn (Đặc biệt Buckets chứa Hợp đồng phải là Private).

## 3. Luồng Nghiệp Vụ Chính (Core Flows)
- [ ] Flow Bán Hàng: Tạo Lead -> Customer -> Quotation -> Contract hoạt động mượt, Status cập nhật chuẩn.
- [ ] Flow Công trình: Contract sinh ra được Project -> Load được list Task (Công việc).
- [ ] Flow Tài Chính: Kế toán tạo được Phiếu Thu (Receipt), Công nợ khách hàng trừ chuẩn xác. Tạo Phiếu Chi (Payment) link được với Công trình.
- [ ] Lợi nhuận Công trình (Profit): Dashboard tính đúng "Thu - Chi" của từng dự án. Sales không xem được số này.
- [ ] Flow Kho Vật tư: Tạo phiếu Xuất kho -> Tồn kho giảm, bắt lỗi xuất âm.

## 4. UI / UX / Preferences
- [ ] Mobile Layout hoạt động ổn (Sidebar biến thành Hamburger, Table vuốt ngang được).
- [ ] Dark/Light Mode chuyển đổi không vỡ màu chữ (Hoặc fallback an toàn về Light).
- [ ] Toàn bộ màn hình danh sách có Empty State (Icon rỗng) thay vì bảng trống.
- [ ] Toàn hệ thống định dạng Tiền tệ Việt Nam Đồng (VND) thống nhất.
- [ ] Người dùng tự edit được Avatar, SĐT cá nhân nhưng KHÔNG sửa được Role của mình.

## 5. Security Check
- [ ] `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không bị dính vào `NEXT_PUBLIC_` trên Vercel.
- [ ] Thử đăng nhập bằng tài khoản Thợ Thi Công: Check URL `/reports` xem hệ thống có đá văng ra ngoài không (Authorization check).
- [ ] Audit Logs có ghi nhận lại hành động "Delete" của người dùng.
- [ ] Admin không thể vô tình "Khoá" hoặc "Xoá" chính tài khoản đang login.

---
**Ngày hoàn tất checklist:** ___/___/202__
**Người Review (Chữ ký):** ________________
