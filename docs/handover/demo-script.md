# Kịch bản Demo Khách Hàng (Demo Script)

Kịch bản này là đường dây logic giúp bạn thuyết trình sự ưu việt của LUMINON ERP trước khách hàng một cách mượt mà nhất.

## Demo 1: Tổng quan (Bức tranh lớn)
1. **Login Admin**: Mở URL, đăng nhập bằng `admin@luminon.vn`.
2. **Dashboard**: Show các biểu đồ Doanh thu, Lead mới. Nhấn mạnh việc số liệu realtime không cần F5.
3. **Phân quyền**: Nhắc nhanh về việc "Một lát nữa em sẽ log in tài khoản Sales để anh thấy bạn đó sẽ không xem được lợi nhuận như mình".

## Demo 2: Cỗ máy kiếm tiền (Quy trình Sales)
1. **Tạo Lead**: Giả sử có khách nhắn tin qua Fanpage. Tạo Lead mới "Anh Hoàng Tủ Bếp".
2. **Chăm sóc**: Bấm vào chi tiết Lead, thêm Note "Đã gọi điện tư vấn, khách ưng ý".
3. **Chốt Khách**: Bấm chuyển Lead thành Customer.
4. **Báo giá**: Từ màn hình Customer, tạo Báo giá "Thi công nội thất Tầng 1". Thêm vài hạng mục (Gỗ MDF, Đèn LED). Chỉ cho khách thấy nó tự tính VAT và Tổng tiền nhanh thế nào.
5. **Hợp đồng**: Đổi trạng thái Báo giá thành `Đã chốt`. Bấm nút "Chuyển thành Hợp đồng". Lập Tiến độ thu tiền: Đợt 1 (50%), Đợt 2 (50%). Ký tên giả lập.

## Demo 3: Vận hành trơn tru (Sản xuất thi công)
1. Bấm nút **"Chuyển Công Trình"** từ Hợp đồng.
2. Sang module **Danh sách Công trình**, mở công trình vừa tạo.
3. Tab **Công việc (Tasks)**: Tạo việc "Lắp tủ bếp" -> Giao cho user `Construction Team`.
4. Tab **Nhật ký**: Giả vờ là thợ, bấm nút Upload một tấm ảnh nội thất lên và ghi chú "Tủ bếp ráp xong góc trái". Nhấn mạnh tính minh bạch của thông tin.

## Demo 4: Quản lý dòng tiền (Kế toán & Lợi nhuận)
1. Vào **Tài chính > Phiếu thu**. Thu ngay 50% tiền cọc Đợt 1 của Hợp đồng vừa xong.
2. Quay lại trang **Khách hàng** -> Cho khách xem CÔNG NỢ đã tự trừ tiền cọc.
3. Vào **Phiếu chi** -> Chi 5 triệu tiền mua đinh ốc. Bắt buộc chọn thuộc **Công trình: Tủ bếp Tầng 1**.
4. Vào **Báo cáo Lợi Nhuận**: Show cho giám đốc xem Công trình Tủ Bếp Tầng 1 đang có Doanh thu (Hợp đồng) là X, Chi phí là 5 triệu -> Lợi nhuận ròng = Y.

## Demo 5: Kho Vật Tư & Phân quyền
1. Vào **Nhập Kho**: Nhập 100 Tấm gỗ MDF.
2. Vào **Xuất Kho**: Xuất đi 20 tấm gắn vào Công trình "Tủ Bếp Tầng 1". Show tồn kho giảm còn 80. Thử xuất 100 tấm -> Hiện lỗi chặn lại (Chứng minh chống thất thoát).
3. **Logout** -> Login bằng tài khoản Sales.
4. Cho khách xem Sidebar: Mất tích hoàn toàn menu Kế toán, Lợi Nhuận, Cài đặt hệ thống. Thể hiện sự phân quyền bảo mật tuyệt đối.
