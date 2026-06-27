# Sổ tay Vận hành Hệ thống (Operation Guide)

Tài liệu hướng dẫn Vận hành dành riêng cho vai trò **Quản trị viên (Admin) / Giám đốc**.

## 1. Mạch Máu Của Hệ Thống
LUMINON ERP xoay quanh 2 mạch chính:
1. **Mạch Bán Hàng (CRM)**: Từ Khách hàng lạ -> Chốt Hợp Đồng.
2. **Mạch Vận Hành (Ops)**: Bàn giao Hợp Đồng cho Đội thi công -> Thu/Chi tiền.

Với tư cách là Giám đốc, bạn chỉ cần ngồi nhìn **Báo cáo Lợi Nhuận**. Nếu lợi nhuận sai, lỗi nằm ở: 
- Kế toán chưa tạo Phiếu Chi.
- Kế toán tạo Phiếu Chi nhưng KHÔNG gán cho Công trình tương ứng.

## 2. Quản lý Tài Khoản & Phân Quyền
1. Truy cập **Hệ thống > Quản lý Người dùng**.
2. **Tạo tài khoản mới**: Nhập Email và Chọn Role (Vai trò). 
3. Nếu chọn **Sales**, họ chỉ được quản lý Khách hàng của chính họ. Không thấy kho, không thấy tiền nội bộ.
4. Nếu chọn **Kế toán**, họ được thấy mọi Phiếu Thu Chi, Công Nợ nhưng không được phép xóa Khách hàng.
5. **Nhân viên nghỉ việc**: Tuyệt đối không Xóa tài khoản để tránh mất dữ liệu liên đới. Vui lòng bấm vào nút **"Khoá Tài Khoản (Deactivate)"**.

## 3. Quản lý Rủi Ro (Audit Logs)
LUMINON ERP trang bị hệ thống "Mắt Thần" ghi lại mọi thao tác.
- Một nhân viên Sales lỡ tay xoá một Khách hàng VIP.
- Bạn chỉ cần vào **Hệ thống > Audit Logs (Nhật ký Hệ thống)**.
- Gõ tên nhân viên đó vào thanh Search. Hệ thống sẽ trả ra: Lúc 14h00, IP 11.22.33.44, user X đã gửi lệnh DELETE lên bảng Customers.

## 4. Xử lý "Tại sao em không thấy Menu X?"
Khi một nhân sự thắc mắc sao họ không thấy chữ "Lợi Nhuận" hay "Kho Vật Tư" trên màn hình.
- Đáp án: Vì họ bị phân quyền ẩn đi.
- **Cách xử lý**: Bạn (Admin) vào trang phân quyền, đổi họ sang Role có cấp quyền cao hơn (Ví dụ: Đổi từ Sales sang Accountant). F5 lại web, menu sẽ hiện ra.

## 5. Làm sao để Công nợ tự động giảm?
Tuyệt đối không có nút "Sửa công nợ bằng tay".
- Khách hàng nợ 100 triệu.
- Để công nợ giảm còn 80 triệu, Kế toán bắt buộc phải tạo 1 **Phiếu Thu** 20 triệu, và chọn thuộc "Hợp đồng A" của khách hàng đó. Công nợ sẽ tự trừ đi cực kỳ minh bạch.
