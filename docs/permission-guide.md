# Cẩm nang Phân Quyền (Permission Guide)

LUMINON ERP sử dụng kiến trúc bảo mật Role-Based Access Control (RBAC). 
Nghĩa là: **Người dùng -> Được gán Vai trò (Role) -> Vai trò chứa nhiều Mã quyền (Permissions)**.

## Ma trận Role mặc định

Dưới đây là 5 Role gốc do hệ thống khởi tạo và giới hạn truy cập của họ:

### 1. ADMIN (Giám đốc / Quản trị viên)
- Truy cập tất cả chức năng.
- Chức năng đặc quyền: **Xem Cài đặt Hệ thống, Quản lý Nhân sự, Xem Lợi nhuận Công trình, Xem Audit Logs**.

### 2. SALES (Nhân viên Kinh doanh)
- Quyền: Quản lý Leads, Khách hàng, Báo giá, Hợp đồng, Đơn hàng Online.
- Bị cấm (Forbidden): Không xem được Phiếu Thu/Chi nội bộ, không xem được Giá vốn (Lợi nhuận), không xem được Settings.

### 3. ACCOUNTANT (Kế toán)
- Quyền: Quản lý Phiếu thu, Phiếu chi, Công nợ khách hàng, Công nợ nhà cung cấp, Báo cáo Doanh thu/Chi phí.
- Bị cấm (Forbidden): Không thao tác vào Nhật ký thi công hay Settings Hệ thống lõi.

### 4. PRODUCTION_MANAGER (Quản đốc Sản xuất/Thi công)
- Quyền: Xem Hợp đồng, Quản lý Danh sách Công trình, Chia Việc (Tasks), Quản lý Nhân công.
- Bị cấm (Forbidden): Không truy cập Kho, Không xem Lợi nhuận.

### 5. WAREHOUSE (Thủ kho)
- Quyền: Xem danh sách Vật tư, Nhà cung cấp, Tạo Phiếu Nhập / Xuất Kho, Lịch sử XNK.
- Bị cấm (Forbidden): Không xem được Giá bán cho khách, Không xem được Hợp đồng, Báo giá.

## Những Permission Nhạy cảm (Cần thận trọng khi cấp)
Nếu bạn tạo một Custom Role mới, hãy hết sức chú ý không tích chọn các quyền sau cho nhân viên thường:
- `settings.manage`: Cho phép người dùng thay đổi Logo công ty, phân quyền người khác.
- `audit_logs.view`: Cho phép soi mọi thao tác hệ thống.
- `reports.profit.view`: Nhìn thấy lợi nhuận ròng của công ty.
- `receipts.delete` / `payments.delete`: Quyền xóa chứng từ tài chính (Nên để Kế toán trưởng giữ).
