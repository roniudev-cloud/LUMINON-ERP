# Sổ tay Giám đốc / Quản trị viên (Admin Guide)

Tài liệu này dành riêng cho vai trò quản trị cấp cao, giúp bạn làm chủ Hệ thống LUMINON ERP.

## 1. Truy cập Hệ thống
1. Truy cập vào đường dẫn: `https://erp.luminon.vn`
2. Đăng nhập bằng Email và Password được khởi tạo.
3. Vì bạn có quyền Admin, toàn bộ hệ thống từ Doanh thu, Chi phí, Công nợ cho đến Lịch sử cài đặt sẽ hiển thị đầy đủ.

## 2. Thiết lập Công ty (Quan trọng)
Ngay sau khi nhận hệ thống, hãy cập nhật thông tin công ty để các bản in PDF/Word hợp lệ:
1. Vào **Hệ thống > Cài đặt chung**.
2. Chọn **Thông tin công ty**.
3. Điền đầy đủ Mã số thuế, Tài khoản ngân hàng, Tên đại diện.
4. Tải lên **Logo công ty**, **Chữ ký Giám đốc** (Ảnh không nền PNG) và **Con dấu**.

## 3. Tạo tài khoản cho Nhân viên
1. Bấm vào **Quản lý Người dùng** trong trang Cài đặt.
2. Bấm nút **"Tạo tài khoản mới"**.
3. Phân đúng nhóm quyền (Role) cho nhân viên. 
   - *Lưu ý*: Sales không được cấp quyền Kế toán để tránh lộ báo cáo chi phí và lợi nhuận. Đội thi công chỉ cần quyền xem Công trình.
4. Nếu nhân sự nghỉ việc, chỉ cần bấm nút "Khoá tài khoản", hệ thống sẽ cấm truy cập ngay lập tức, nhưng không làm mất dữ liệu lịch sử của họ.

## 4. Theo dõi Lịch sử Hệ thống (Audit Logs)
Với cương vị Admin, bạn có thể kiểm tra mọi "Dấu chân" của nhân sự:
1. Vào **Hệ thống > Cài đặt chung > Nhật ký hệ thống (Audit Logs)**.
2. Bảng này sẽ liệt kê: Nhân viên X đã tạo Báo giá Y vào lúc mấy giờ, từ thiết bị (IP) nào.
3. Rất hữu ích để truy vết khi có sự cố "Ai xoá nhầm khách hàng?", "Ai đổi số tiền Hợp đồng?".

## 5. Duyệt Chi phí & Lợi nhuận Công trình
Chỉ Admin và Kế toán có quyền xem mục Lợi Nhuận:
1. Vào **Vận hành & Thi công > Tổng quan BC**.
2. Bấm vào trang **Doanh thu** và **Chi phí** để xem biểu đồ dòng tiền.
3. Lợi nhuận được tính Tự động theo công thức:
   `Tiền thực thu từ Hợp đồng - Tiền thực chi (Nhập vật tư, Chi phí khác cho Công trình)`.
