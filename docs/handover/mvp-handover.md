# Báo cáo Bàn Giao MVP LUMINON ERP

## 1. Thông tin Dự án
- **Tên dự án**: Hệ thống quản trị doanh nghiệp LUMINON ERP
- **Phiên bản**: v1.0.0 (MVP)
- **Mục tiêu**: Số hóa toàn diện quy trình làm việc (Bán hàng, Kế toán, Sản xuất, Tồn kho) cho doanh nghiệp Nội thất và Quảng cáo.
- **Link Demo Deployment**: `[Đường_Dẫn_Vercel_Của_Bạn]`
- **Supabase Dashboard**: `[Đường_Dẫn_Supabase_Project]`

## 2. Tech Stack (Công nghệ Cốt lõi)
- **Frontend**: Next.js 14+ App Router, React 18, TailwindCSS.
- **UI Components**: Shadcn UI, Radix UI.
- **Database & Auth**: Supabase PostgreSQL, Drizzle ORM.
- **Form & Validation**: React Hook Form, Zod.

## 3. Tài khoản Demo
Vui lòng sử dụng các tài khoản sau để nghiệm thu (Mật khẩu chung: `Admin@123456`):
- **Admin**: `admin@luminon.vn`
- **Sales**: `sales@luminon.vn`
- **Kế toán**: `accountant@luminon.vn`
- **Quản lý Thi công**: `production@luminon.vn`
- **Thợ Thi công**: `construction@luminon.vn`
- **Thủ kho**: `warehouse@luminon.vn`

## 4. Các Module đã Hoàn thành
- **Quản trị Bán hàng**: Khách hàng, Leads, Báo giá, Hợp đồng, Đơn hàng Online.
- **Quản lý Sản xuất**: Dự án, Nhật ký thi công, Công việc nhóm.
- **Kế toán Nội bộ**: Phiếu Thu, Phiếu Chi, Báo cáo Lợi nhuận, Công nợ Khách hàng/Nhà cung cấp.
- **Quản trị Kho**: Vật tư, Nhà cung cấp, Nhập Kho, Xuất Kho.
- **Tiện ích**: Thông báo, Nhắc việc, Lịch công việc, Hồ sơ cá nhân.

## 5. Flow Quy trình đã Kiểm duyệt (Pass)
- [x] CRM: Chuyển Lead -> Customer.
- [x] Bán Hàng: Lập Báo giá -> Chốt -> Sinh Hợp Đồng -> Sinh Công trình.
- [x] Tài chính: Kế toán thu tiền -> Trừ công nợ Khách hàng. Kế toán chi tiền -> Trừ vào lợi nhuận Công trình.
- [x] Kho: Thủ kho xuất vật tư -> Tồn kho tự giảm. Báo lỗi khi xuất lố.

## 6. Điều Kiện Nghiệm Thu MVP
1. Hệ thống vận hành trơn tru không phát sinh màn hình sập (Crash).
2. Quy trình Bán Hàng -> Sản xuất -> Thu Tiền khép kín, logic số liệu công nợ không bị âm vô lý.
3. Đáp ứng đủ 15 điều kiện trong `acceptance-checklist.md`.
4. Bàn giao đầy đủ source code kèm hướng dẫn Deploy.

## 7. Lộ trình V2 (Roadmap Nâng Cấp)
Sau khi đưa MVP vào sử dụng thực tế 1-2 tháng, chúng tôi đề xuất mở rộng LUMINON ERP V2 với:
- Tích hợp Zalo OA nhắn tin trực tiếp với khách từ hệ thống.
- Chạy hệ thống Push Notification Native trên App Mobile (Android/iOS).
- Auto Report: Tự động gửi báo cáo thu chi hàng ngày qua Email Giám đốc.
