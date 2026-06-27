# LUMINON ERP — Ma trận Yêu cầu (Requirements Traceability Matrix)

**Mục đích:** Đối chiếu đặc tả khách hàng (29 mục, MITA) với code thật trong repo tại thời điểm audit. Dùng tài liệu này làm nguồn sự thật duy nhất khi quyết định build/giữ/disable module — **không xóa bất kỳ dòng nào khỏi tài liệu này khi module chưa xong, chỉ cập nhật trạng thái.**

**Ngày audit:** 2026-06-25 — **cập nhật build:** 2026-06-26 (xem ghi chú "Build xong 2026-06-26" rải trong các bảng dưới, và Phụ lục C cho 2 lỗi nghiêm trọng phát hiện/sửa trong phiên build này)
**Phương pháp:** Đọc trực tiếp `drizzle/schema/**`, `src/actions/**`, `src/app/(erp)/**`, `src/features/**` + đối chiếu với `docs/handover/completed-features.md`, `docs/known-limitations.md`, `docs/pre-handover-checklist.md` (tài liệu nội bộ cũ).

## ⚠️ Phát hiện quan trọng nhất

`docs/handover/completed-features.md` ghi nhận **"[Hoàn thành]"** cho Kho vật tư (phiếu nhập/xuất), Báo cáo thống kê (lợi nhuận theo công trình, xuất PDF chuyên nghiệp), Omnichannel Inbox UI, Reminders, Calendar. Audit thực tế cho thấy **các UI page này không tồn tại trong code hiện tại** (không có file, không có route) — chỉ còn lại bảng database và một vài API webhook nhận dữ liệu thô. `lib/modules.ts` cũng chỉ định nghĩa 11 "core" module dù kiểu `ModuleStatus` có sẵn `"phase_2" | "hidden"` (tức registry từng được thiết kế để chứa nhiều hơn). `lib/routes.ts` có hẳn một khối `PHASE2 {...}` với comment *"kept for reference, not rendered in MVP sidebar"* chứa ~25 route không có trang tương ứng.

**Kết luận:** Đây không phải lỗi do tôi gây ra trong phiên QA vừa rồi (đã verify không có git history để xác minh thời điểm, nhưng cấu trúc code + tài liệu cũ cho thấy việc này xảy ra ở một lần "dọn dẹp MVP" trước đó). Tài liệu này phục hồi đúng phạm vi theo đặc tả mới nhất bạn cung cấp.

**Tin tốt:** Lớp database (Drizzle schema) **đầy đủ hơn nhiều so với UI** — đa số bảng cần thiết đã tồn tại sẵn (quotation_templates, contract_payment_terms, contract_signatures, acceptance_reports, liquidation_reports, online_orders, channel_accounts...). Phần lớn việc còn lại là **nối UI/action vào bảng đã có**, không phải tạo từ đầu.

---

## Chú giải trạng thái
- **ready** — Có route, action, UI thật, dùng được ngay.
- **partial** — Có một phần (DB có nhưng UI thiếu, hoặc UI có nhưng thiếu thao tác quan trọng).
- **missing** — Không có route/UI nào, dù DB có thể đã có.
- **broken** — Có code nhưng lỗi runtime/import (không chạy được).

---

## PHASE 1 — Bắt buộc dùng được ngay

| # | Module | Mô tả | Trạng thái | Route | DB table | Server action | UI | Ưu tiên | Việc cần làm để usable 100% |
|---|--------|-------|-----------|-------|----------|---------------|-----|---------|------------------------------|
| 1 | Dashboard tổng quan | Doanh thu/chi/lợi nhuận/công nợ/KH mới/báo giá chờ/HĐ hiệu lực | **ready** | `/dashboard` | `customers,leads,quotations,contracts,receipts,payments,customerDebts,supplierDebts,projects,tasks,materials` | `src/actions/dashboard.ts` | `src/app/(erp)/dashboard/page.tsx`, `features/dashboard/universal-dashboard.tsx` | P0 | **Cập nhật 2026-06-26:** sửa lỗi mock data ở biểu đồ doanh thu (dùng SQL aggregate thật theo tháng), thêm nhóm thẻ Kho + Lợi nhuận (top 5 công trình lời/lỗ). Còn thiếu: bộ lọc khoảng ngày tùy chỉnh. |
| 2 | CRM khách hàng | Thông tin KH, nguồn, trạng thái, lịch sử | **ready** | `/customers`, `/customers/[id]`, `/customers/[id]/edit` | `customers, customer_activities, customer_sources, customer_statuses` (`drizzle/schema/crm.ts`) | `src/actions/customers.ts` | `src/features/customers/**` | P0 | **Cập nhật 2026-06-26:** đã thêm field Zalo/Facebook/Website + chức năng gộp khách hàng trùng (phát hiện theo SĐT, chuyển toàn bộ dữ liệu liên quan, xóa mềm bản trùng) — verify thật. Tab "Lịch sử đơn hàng online" vẫn chưa có (chờ module Online Orders). |
| 3 | Báo giá | Tạo báo giá, hạng mục, tính tiền tự động, chuyển hợp đồng | **ready** | `/quotations`, `/quotations/new`, `/quotations/[id]`, `/quotations/[id]/edit` | `quotations, quotation_items, quotation_templates` (`drizzle/schema/sales.ts`) | `src/actions/quotations.ts` (có `convertQuotationToContract()`) | `src/features/quotations/**`, `export-word-button.tsx` | P0 | CRUD + tính VAT/chiết khấu/tổng + chuyển thành hợp đồng đã chạy thật. **Xuất PDF vẫn là `window.print()`** (chấp nhận được, giữ nguyên). **Xuất Word đã nối thật 2026-06-26** (mẫu DOCX dựng sẵn, điền dữ liệu thật). Gửi Email/Zalo/WhatsApp vẫn là toast "sẽ hoàn thiện ở phase tiếp theo" — đúng nguyên tắc, không fake. |
| 4 | Thư viện mẫu báo giá | Upload DOCX/PDF mẫu, phân loại, biến `{{...}}` | **missing** | — | `quotation_templates` (chỉ có name/description/content jsonb, **chưa có file upload**), `document_templates` (có fileUrl + variables array, hỗ trợ type="quotation" nhưng chưa có UI) | — | — | P1 | Cần trang `/settings/documents` (đã có) mở rộng thêm tab "Mẫu báo giá", dùng bảng `document_templates` có sẵn để upload + chọn category + khai báo placeholder. |
| 5 | Hợp đồng | Tạo từ báo giá, mã tự sinh, giá trị, tiến độ thanh toán | **ready** | `/contracts`, `/contracts/new`, `/contracts/[id]`, `/contracts/[id]/edit` | `contracts, contract_items, contract_payment_terms, contract_files, contract_signatures, contract_templates` (`drizzle/schema/sales.ts`) | `src/actions/contracts.ts` | `src/features/contracts/**`, `digital-signature-dialog.tsx`, `export-word-button.tsx` | P0 | CRUD chính + ký điện tử + **Xuất Word (mới 2026-06-26)** chạy thật. `contract_payment_terms` vẫn chỉ hiển thị read-only — cần thêm UI thêm/sửa/xóa từng đợt thanh toán. |
| 6 | Thư viện mẫu hợp đồng | Upload mẫu HĐ thi công/nội thất/gia công/phụ lục/nghiệm thu/thanh lý | **partial** | — | `contract_templates` (có field `type`: thi_cong/noi_that/gia_cong/phu_luc/nghiem_thu), `contract_files` | — | — | P1 | Bảng đã có cấu trúc đúng. Cần UI quản lý (giống mục 4) — gộp chung 1 trang "Thư viện mẫu tài liệu" cho cả báo giá + hợp đồng + biên bản. |
| 7 | Quản lý thu tiền | Phiếu thu, loại, chứng từ, tự trừ công nợ KH | **ready** | `/receipts`, `/receipts/[id]` | `receipts, finance_files, customer_debts` | `src/actions/finance.ts: createReceipt()` (tự cập nhật `customerDebts` đúng) | `src/features/finance/**` | P0 | Đã chạy thật, đã verify trong QA. Xuất PDF qua `window.print()` (chấp nhận được — đổi nhãn nút cho đúng thực tế nếu cần). |
| 8 | Quản lý chi phí | Phiếu chi, nhóm chi, chứng từ, tự trừ công nợ NCC | **ready** | `/payments`, `/payments/[id]` | `payments, finance_files, supplier_debts` | `src/actions/finance.ts: createPayment()` (đã sửa trong phiên này — tự cập nhật `supplierDebts`) | `src/features/finance/**` | P0 | Đã chạy thật (vừa fix + verify bằng 1 giao dịch thật trong phiên QA). Nhóm chi hiện là enum chung (material/labor/...) khác với danh sách Alu/Mica/Inox của đặc tả — xem ghi chú dưới bảng. |
| 9 | Công nợ khách hàng | Tự tính còn lại, quá hạn, % đã thu, cảnh báo đỏ | **partial** | `/debts` (tab "Công nợ khách hàng") | `customer_debts` | `src/actions/finance.ts`, `src/actions/debts.ts` | `src/features/finance/client-debts-table.tsx` | P0 | Tính `remainingAmount` đúng. **Chưa có**: tính số ngày quá hạn, cảnh báo đỏ UI khi overdue (status enum có "overdue" nhưng không có job/logic tự set). |
| 10 | Công nợ nhà cung cấp | Theo dõi NCC, tự tính còn phải trả | **ready** (vừa fix) | `/debts` (tab "Công nợ nhà cung cấp") | `supplier_debts, suppliers` | `src/actions/finance.ts createPayment()` (vừa thêm logic), `src/actions/debts.ts getSupplierDebts()` | `src/features/finance/client-debts-table.tsx` | P0 | Đã verify chạy thật trong phiên QA (tạo phiếu chi → số dư NCC cập nhật đúng). Hạn chế: không có khái niệm "tổng nợ gốc" từ đơn mua hàng — `remainingAmount` luôn về 0 sau khi trả vì hệ thống chưa ghi nhận công nợ phát sinh từ lúc *nhận hàng* (chỉ ghi khi *trả tiền*). Cần làm rõ nghiệp vụ: có nên ghi nợ NCC ngay khi nhận vật tư (trước khi thanh toán)? |
| 11 | Phiếu thu | Mã tự sinh, người nộp, số tiền, xuất PDF | **ready** | `/receipts/[id]` | `receipts` | `src/actions/finance.ts` | `receipt-detail.tsx` | P0 | Đã chạy thật. |
| 12 | Phiếu chi | Mã tự sinh, người nhận, số tiền, xuất PDF | **ready** | `/payments/[id]` | `payments` | `src/actions/finance.ts` | `payment-detail.tsx` | P0 | Đã chạy thật. Vừa thêm field "Nhà cung cấp" vào form trong phiên QA. |
| 13 | Báo cáo cơ bản | Theo tháng/công trình/KH/nhân viên | **ready** | `/reports` | Tính từ `receipts,payments,projects,quotations,contracts` | `src/actions/reports.ts` | `src/features/reports/**` | P0 | Build xong: 4 tab (thời gian — có chọn ngày/tuần/tháng, công trình, KH, nhân viên). |
| 14 | Người dùng | CRUD user, gán role | **ready** | `/settings/users`, `/settings/users/new`, `/settings/users/[id]/edit` | `users, user_roles` | `src/actions/users.ts` | `src/features/users/**` | P0 | **Build xong 2026-06-26:** tạo tài khoản tạo user Supabase Auth THẬT (`createAdminClient().auth.admin.createUser`), sửa thông tin/vai trò, khóa/mở khóa, search/filter thật. Đã verify tạo+khóa+xóa 1 tài khoản test thật. |
| 15 | Vai trò / Phân quyền | CRUD role, gán permission | **ready** | `/settings/roles` | `roles, permissions, role_permissions` | `src/actions/roles.ts` | `src/features/users/client-roles-grid.tsx` | P0 | **Build xong 2026-06-26 + phát hiện sửa lỗi nghiêm trọng:** bảng `permissions`/`role_permissions` trong DB từng **hoàn toàn trống** — `DEFAULT_ROLE_PERMISSIONS` trong code chưa từng được áp dụng vào DB thật, mọi role không phải admin có 0 quyền. Đã viết `scripts/seed-permissions.ts` đồng bộ 162 permissions/285 links. UI giờ có tạo/sửa quyền/xóa role thật. |

**Ghi chú nhóm chi phí (mục 8):** Đặc tả liệt kê nhóm chi rất cụ thể theo ngành quảng cáo (Alu, Mica, Inox, LED, Sơn, Sắt...) nhưng code hiện dùng enum chi phí tổng quát hơn (material, labor, subcontract, transport, utility, marketing, office, tool, extra, other). Đề xuất: thêm các giá trị ngành-cụ-thể này làm **sub-category** của "material" thay vì thay hẳn enum tổng quát (giữ khả năng dùng cho nội thất + bảng hiệu + thi công chung). Cần bạn xác nhận hướng này trước khi sửa.

---

## PHASE 2 — Giữ lại, build sau Phase 1

| # | Module | Mô tả | Trạng thái | Route | DB table | Server action | UI | Ưu tiên | Việc cần làm |
|---|--------|-------|-----------|-------|----------|---------------|-----|---------|--------------|
| 1 | Quản lý công trình | Công trình, trạng thái, tiến độ | **ready** | `/projects`, `/projects/[id]`, `/projects/[id]/edit` | `projects, project_statuses` | `src/actions/projects.ts` | `src/features/projects/**` | P1 | Hoạt động tốt. Enum trạng thái tiếng Anh chi tiết hơn đặc tả (new/design/design_review/production/waiting_materials/in_progress/paused/waiting_acceptance/accepted/completed/paid/warranty/cancelled) — đã có label tiếng Việt đầy đủ (sửa trong phiên QA trước). Thiếu: lịch sử % tiến độ theo thời gian (hiện chỉ có 1 cột `progress` tĩnh, không có bảng `project_progress_updates`). |
| 2 | Nhật ký thi công | Ảnh/video/note theo ngày, giai đoạn | **partial** | `/projects/[id]` (tab) | `project_logs, project_files` | `src/actions/projects.ts` | `project-logs-tab.tsx`, `project-files-tab.tsx` | P1 | Bảng đúng cấu trúc (`project_logs` có category trước/trong/sau thi công). UI hiện **tách rời 2 tab riêng** (nhật ký text và file ảnh không gộp chung 1 form) — cần gộp lại để 1 lần nhập = 1 entry có cả ảnh lẫn note. |
| 3 | Kho vật tư | Danh mục, nhập/xuất, tồn, cảnh báo hết hàng | **ready** | `/inventory` | `material_categories, materials, suppliers, stock_tickets, stock_ticket_items, stock_movements, inventory_files` | `src/actions/inventory.ts` | `src/features/inventory/**` | P1 | **Build xong 2026-06-26.** Phiếu nhập/xuất tự cập nhật `stock_movements` + `materials.currentStock` trong 1 transaction, chặn xuất kho vượt tồn, cảnh báo sắp hết hàng. |
| 4 | Quản lý nhân công | Thợ, công nhật/khoán việc, ứng/còn lại | **partial** | `/workers`, `/workers/[id]` | `worker_roles, workers, worker_attendances, worker_advances, worker_payments` (+ cột `payment_type` mới) | `src/actions/workers.ts` | `src/features/workers/**` | P1 | CRUD thợ chạy thật. Cột `payment_type` (công nhật/khoán việc) đã thêm vào DB nhưng **UI chưa hiển thị/chọn được** — cần bổ sung field vào form trả lương. Vẫn thiếu UI hiển thị số dư đã ứng/còn phải trả theo thợ. |
| 5 | Biên bản nghiệm thu | Sinh từ dự án, ký điện tử, xuất PDF | **ready** | `/acceptance-reports` | `acceptance_reports` | `src/actions/documents.ts` | `src/features/documents/**` | P2 | **Build xong 2026-06-26.** Tái dùng `SignaturePadDialog` chung (tách từ `digital-signature-dialog.tsx` của hợp đồng). Ký riêng KH/công ty, tự chuyển "signed" khi đủ 2 chữ ký. |
| 6 | Biên bản thanh lý | Sinh từ dự án, ký điện tử, xuất PDF | **ready** | `/liquidation-reports` | `liquidation_reports` | `src/actions/documents.ts` | `src/features/documents/**` | P2 | **Build xong 2026-06-26.** Chọn công trình tự gợi ý hợp đồng liên quan. |
| 7 | Hóa đơn VAT | Lưu số HĐ, ngày, giá trị, file PDF, liên kết HĐ | **ready** | `/vat-invoices` | `vat_invoices` | `src/actions/vat-invoices.ts` | `client-vat-invoices-table.tsx` | P2 | Đã hoàn thiện action + validation + route (phiên trước). |

---

## PHASE 3 — Giữ roadmap, không xóa

| # | Module | Mô tả | Trạng thái | DB table | Ghi chú |
|---|--------|-------|-----------|----------|---------|
| 1 | Sản phẩm bán online | SKU, biến thể màu/size/chất liệu | **missing UI** (DB có) | `products, product_variants` (`drizzle/schema/online-sales.ts`) | Schema đầy đủ hơn đặc tả yêu cầu (có costPrice, compareAtPrice). Không route nào, không trong sidebar. |
| 2 | Đơn hàng online | Nguồn FB/Zalo/Web/TikTok, trạng thái | **missing UI** (DB có) | `online_orders, online_order_items, online_order_payments` | Schema đầy đủ (có shippingFee, discount, payment method cod/bank_transfer/momo/vnpay). |
| 3 | Kết nối Fanpage Facebook | Đồng bộ tin nhắn/bình luận/lead tự động | **partial (webhook only)** | `channel_accounts, conversations, conversation_messages, webhook_events` (`drizzle/schema/omnichannel.ts`) | `src/app/api/webhooks/facebook/route.ts` nhận webhook và lưu raw event — **chưa xử lý thành conversation/message thật, chưa có UI inbox**. Đúng theo nguyên tắc "không fake sync" — giữ trạng thái `integration_required`, chờ Page Access Token thật từ khách. |
| 4 | Kết nối Zalo OA | Đồng bộ khách hàng/tin nhắn | **partial (webhook only)** | Dùng chung schema omnichannel ở trên | `src/app/api/webhooks/zalo/route.ts` tương tự Facebook. Chờ Zalo OA token thật. |

---

## PHASE 4

| # | Module | Trạng thái | Ghi chú |
|---|--------|-----------|---------|
| 1 | App Mobile Native | **planned** | Hiện tại là PWA responsive (đã verify mobile/tablet trong QA — chạy tốt). Chưa có React Native app, chưa có Push Notification native. Đúng theo lộ trình đặc tả, không cần làm gì ở giai đoạn này. |

---

## Phụ lục A — Hệ thống/RBAC (nền tảng, không thuộc phase cụ thể)

| Hạng mục | Trạng thái | Chi tiết |
|----------|-----------|----------|
| `companies` | ready | `drizzle/schema/auth.ts` |
| `users` (canonical identity) | ready | Không có bảng `profiles` trùng lặp — `users` là nguồn duy nhất, 79+ FK tham chiếu đúng. |
| `roles`, `permissions`, `role_permissions` | ready | `drizzle/schema/auth.ts` |
| `audit_logs` | ready | Đóng vai trò "activity_logs" theo đặc tả, đủ field (action/module/entityId/oldData/newData/IP). |
| Attachments | ready (modular) | Không dùng 1 bảng `attachments` chung — mỗi module có bảng file riêng (`finance_files, project_files, inventory_files, contract_files`). Thiết kế hợp lý hơn 1 bảng chung dùng `bucket` polymorphic, **giữ nguyên, không đổi**. |
| `requireAuth(permissionCode)` guard | ready | Dùng nhất quán trong mọi server action. |
| 6 role nghiệp vụ (Admin/Sales/Accountant/Production/Construction/Warehouse + Manager/Viewer) | ready | `DEFAULT_ROLE_PERMISSIONS` trong `lib/constants.ts` định nghĩa đúng theo đặc tả: Sales không có quyền xem profit/finance, không có quyền delete; Accountant có đủ quyền thu/chi/công nợ/báo cáo; Production/Construction chỉ xem, không có quyền tài chính. |

---

## Phụ lục B — Đối chiếu `docs/handover/*` cũ vs thực tế (để minh bạch, không phải lỗi của phiên QA này)

| Tài liệu cũ ghi nhận | Thực tế hiện tại | 
|---|---|
| "Kho Vật Tư - [Hoàn thành]: Lập phiếu Nhập/Xuất kho, Cảnh báo tồn" | Không có route `/inventory`, chỉ có trang cấu hình `/settings/inventory`. |
| "Báo Cáo Thống Kê - [Hoàn thành]: Lợi nhuận theo công trình, Export PDF chuyên nghiệp" | Không có route `/reports` nào. PDF export = `window.print()`. |
| "Omnichannel - Đã dựng sẵn UI Gom tin nhắn (Inbox)" | Không tìm thấy file/route inbox nào, chỉ còn webhook nhận raw event. |
| "Bán Hàng Online... Reminders, Calendar - Hoàn thành" | Bảng `reminders`, `calendar_events` tồn tại (`drizzle/schema/productivity.ts`) nhưng không có route/UI nào. Lưu ý: 2 module này **không có trong đặc tả mới nhất bạn gửi** — đề xuất giữ nguyên trạng thái "không thuộc phạm vi hiện tại" trừ khi bạn xác nhận cần. |
| "Notification (chuông) - đã hoạt động 100%" | Đã verify: chuông hoàn toàn tĩnh, không có state/data, **đã sửa trong phiên QA trước khi nhận yêu cầu này**. |

**Nhận định:** Không có git history để xác minh chính xác việc này xảy ra khi nào, nhưng bằng chứng hội tụ (registry chỉ giữ 11/30+ module, routes.ts có khối "PHASE2 kept for reference", code component không còn tồn tại dù DB vẫn còn) cho thấy một lần cắt giảm phạm vi trước đây đã xóa UI thay vì chỉ ẩn/disable — đúng như bạn nghi ngờ. Tài liệu này + `lib/modules.ts` (Phần 2) sẽ là rào chắn để việc này không lặp lại.

---

## Phụ lục C — 2 lỗi nghiêm trọng phát hiện & sửa trong phiên build 2026-06-26

1. **Dashboard dùng mock data thật trong code.** `universal-dashboard.tsx` có biến `revenueData` với comment ngay trong code "Mock revenue chart data", chỉ render 1 điểm dữ liệu giả cho biểu đồ Tài chính tổng quan — vi phạm trực tiếp nguyên tắc "không dùng mock data như dữ liệu thật". Đã sửa: tính SQL aggregate thật theo tháng từ `receipts`/`payments` trong `actions/dashboard.ts`, truyền dữ liệu thật vào `RevenueChart`.

2. **Toàn bộ hệ thống RBAC theo DB chưa từng được kích hoạt.** Bảng `permissions` có **0 dòng**, bảng `roles` chỉ có "admin" — `DEFAULT_ROLE_PERMISSIONS` trong `lib/constants.ts` (nguồn quyền hạn cho 8 role nghiệp vụ) **chưa từng được ghi vào DB**. Hệ quả: bất kỳ user nào được gán role khác admin (sales/manager/accountant/production_manager/construction_team/warehouse_staff/viewer) sẽ nhận **0 quyền** ở mọi lệnh gọi `requireAuth(permissionCode)`, bị "Forbidden" ở hầu hết hành động. Vì tài khoản test duy nhất trong suốt các phiên QA trước là `admin@luminon.vn` (role admin — có bypass riêng, không qua bảng `role_permissions`), lỗi này không bị phát hiện cho tới khi build chức năng Users/Roles CRUD và thử tạo + gán role "sales" cho 1 tài khoản thật. Đã sửa bằng `scripts/seed-permissions.ts` (idempotent, an toàn chạy lại): đồng bộ 8 roles / 162 permissions / 285 role-permission links từ `constants.ts` vào DB.
