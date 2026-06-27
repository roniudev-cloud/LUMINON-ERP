import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserPlus,
  FileText,
  FileSignature,
  HardHat,
  CheckSquare,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Settings,
  Hammer,
  Package,
  Truck,
  FileCheck2,
  FileX2,
  Receipt,
  ShoppingCart,
  ListOrdered,
  Share2,
  MessageCircle,
  CalendarDays,
} from "lucide-react";
import { ROUTES } from "./routes";

// ─── Module Phase & Status ───────────────────────────────────────────
// phase: giai đoạn theo roadmap đặc tả (1 = bắt buộc dùng được ngay).
// status: tiến độ build thật của module, độc lập với phase.
export type ModulePhase = 1 | 2 | 3 | 4;
export type ModuleBuildStatus = "ready" | "in_progress" | "planned" | "blocked";

// ─── Module Group ───────────────────────────────────────────────────
export type ModuleGroup =
  | "overview"
  | "crm_sales"
  | "documents"
  | "finance"
  | "operations"
  | "inventory"
  | "online_sales"
  | "system";

export const MODULE_GROUP_LABELS: Record<ModuleGroup, string> = {
  overview: "Tổng quan",
  crm_sales: "CRM & Kinh doanh",
  documents: "Hợp đồng & Tài liệu",
  finance: "Tài chính & Công nợ",
  operations: "Thi công & Sản xuất",
  inventory: "Kho & Vật tư",
  online_sales: "Bán hàng Online",
  system: "Hệ thống",
};

// ─── Module Definition ──────────────────────────────────────────────
export interface ModuleDefinition {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: ModuleGroup;
  phase: ModulePhase;
  status: ModuleBuildStatus;
  /** Tắt hẳn (không cho truy cập dù gõ thẳng URL) — khác với chỉ ẩn sidebar. */
  enabled: boolean;
  /** Có hiện link trong sidebar chính không. Module Phase 2 có thể true (kèm badge) hoặc false (chỉ giữ trong registry). */
  visibleInSidebar: boolean;
  description: string;
  permission?: string;
  /** Bảng DB chính module này phụ thuộc — phục vụ tra cứu/audit, không dùng runtime. */
  requiredTables?: string[];
  /** Server action file chính — phục vụ tra cứu/audit, không dùng runtime. */
  requiredActions?: string[];
}

// ─── All Modules (đầy đủ theo đặc tả — KHÔNG xóa entry khi module chưa xong, chỉ đổi status) ──
export const MODULES_CONFIG: ModuleDefinition[] = [
  // ── Tổng quan ── Phase 1
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.ERP.DASHBOARD,
    icon: LayoutDashboard,
    group: "overview",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "dashboard.view",
    description: "Tổng quan doanh thu, chi phí, công nợ, lợi nhuận.",
    requiredTables: ["customers", "leads", "quotations", "contracts", "receipts", "payments", "customer_debts", "supplier_debts", "projects", "tasks"],
    requiredActions: ["src/actions/dashboard.ts"],
  },
  {
    id: "reports",
    label: "Báo cáo",
    href: ROUTES.ERP.REPORTS.OVERVIEW,
    icon: BarChart3,
    group: "overview",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "reports.view",
    description: "Báo cáo doanh thu/chi phí/lợi nhuận theo tháng, công trình, khách hàng, nhân viên.",
    requiredTables: ["receipts", "payments", "projects", "quotations", "contracts"],
    requiredActions: ["src/actions/reports.ts"],
  },

  // ── CRM & Kinh doanh ── Phase 1
  {
    id: "customers",
    label: "Khách hàng",
    href: ROUTES.ERP.CUSTOMERS,
    icon: Users,
    group: "crm_sales",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "customers.view",
    description: "Quản lý thông tin khách hàng, nguồn, trạng thái, lịch sử chăm sóc.",
    requiredTables: ["customers", "customer_activities", "customer_sources", "customer_statuses"],
    requiredActions: ["src/actions/customers.ts"],
  },
  {
    id: "leads",
    label: "Lead",
    href: ROUTES.ERP.LEADS,
    icon: UserPlus,
    group: "crm_sales",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "leads.view",
    description: "Quản lý khách hàng tiềm năng, chuyển đổi thành khách hàng chính thức.",
    requiredTables: ["leads", "lead_sources"],
    requiredActions: ["src/actions/leads.ts"],
  },

  // ── Hợp đồng & Tài liệu ── Phase 1
  {
    id: "quotations",
    label: "Báo giá",
    href: ROUTES.ERP.QUOTATIONS,
    icon: FileText,
    group: "documents",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "quotations.view",
    description: "Tạo báo giá nhiều hạng mục, tự tính VAT/chiết khấu, chuyển thành hợp đồng.",
    requiredTables: ["quotations", "quotation_items", "quotation_templates"],
    requiredActions: ["src/actions/quotations.ts"],
  },
  {
    id: "contracts",
    label: "Hợp đồng",
    href: ROUTES.ERP.CONTRACTS,
    icon: FileSignature,
    group: "documents",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "contracts.view",
    description: "Quản lý hợp đồng, tiến độ thanh toán theo đợt, ký điện tử.",
    requiredTables: ["contracts", "contract_items", "contract_payment_terms", "contract_files", "contract_signatures", "contract_templates"],
    requiredActions: ["src/actions/contracts.ts"],
  },
  {
    id: "document_templates",
    label: "Thư viện mẫu",
    href: ROUTES.ERP.DOCUMENT_TEMPLATES,
    icon: FileCheck2,
    group: "documents",
    phase: 1,
    status: "planned",
    enabled: false,
    visibleInSidebar: false,
    permission: "document_templates.view",
    description: "Thư viện mẫu báo giá/hợp đồng do người dùng tự upload/tùy biến (DOCX/PDF, biến {{...}}). Xuất Word với mẫu cố định dựng sẵn đã hoạt động ở trang Báo giá/Hợp đồng — module này là phần quản trị mẫu nâng cao, chưa xây.",
    requiredTables: ["document_templates", "quotation_templates", "contract_templates"],
  },

  // ── Thi công & Sản xuất ── Phase 1 (Công trình) + Phase 2 (phần còn lại)
  {
    id: "projects",
    label: "Công trình",
    href: ROUTES.ERP.PROJECTS,
    icon: HardHat,
    group: "operations",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "projects.view",
    description: "Quản lý dự án thi công, nhật ký, tiến độ.",
    requiredTables: ["projects", "project_statuses", "project_logs", "project_files"],
    requiredActions: ["src/actions/projects.ts"],
  },
  {
    id: "tasks",
    label: "Công việc",
    href: ROUTES.ERP.TASKS,
    icon: CheckSquare,
    group: "operations",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "tasks.view",
    description: "Giao việc và theo dõi tiến độ.",
    requiredTables: ["tasks"],
    requiredActions: ["src/actions/tasks.ts"],
  },
  {
    id: "calendar",
    label: "Lịch",
    href: ROUTES.ERP.CALENDAR,
    icon: CalendarDays,
    group: "operations",
    phase: 2,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "calendar.view",
    description: "Tổng hợp mốc thời gian: công việc, báo giá, hợp đồng, công trình, công nợ.",
    requiredTables: ["tasks", "quotations", "contracts", "contract_payment_terms", "projects", "customer_debts"],
    requiredActions: ["src/actions/calendar.ts"],
  },
  {
    id: "workers",
    label: "Nhân công",
    href: ROUTES.ERP.WORKERS,
    icon: Hammer,
    group: "operations",
    phase: 2,
    status: "in_progress",
    enabled: true,
    visibleInSidebar: true,
    permission: "workers.view",
    description: "Quản lý nhân công thi công, công nhật/khoán việc, tiền ứng.",
    requiredTables: ["workers", "worker_roles", "worker_attendances", "worker_advances", "worker_payments"],
    requiredActions: ["src/actions/workers.ts"],
  },
  {
    id: "acceptance_reports",
    label: "Biên bản nghiệm thu",
    href: ROUTES.ERP.ACCEPTANCE_REPORTS,
    icon: FileCheck2,
    group: "operations",
    phase: 2,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "acceptance_reports.view",
    description: "Sinh biên bản nghiệm thu từ công trình, ký điện tử khách hàng & công ty.",
    requiredTables: ["acceptance_reports"],
    requiredActions: ["src/actions/documents.ts"],
  },
  {
    id: "liquidation_reports",
    label: "Biên bản thanh lý",
    href: ROUTES.ERP.LIQUIDATION_REPORTS,
    icon: FileX2,
    group: "operations",
    phase: 2,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "liquidation_reports.view",
    description: "Sinh biên bản thanh lý hợp đồng/công trình, xác nhận ký.",
    requiredTables: ["liquidation_reports"],
    requiredActions: ["src/actions/documents.ts"],
  },

  // ── Kho & Vật tư ── Phase 2
  {
    id: "inventory",
    label: "Kho vật tư",
    href: ROUTES.ERP.INVENTORY.OVERVIEW,
    icon: Package,
    group: "inventory",
    phase: 2,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "inventory.view",
    description: "Danh mục vật tư, nhập/xuất kho, tồn kho tự động cập nhật, cảnh báo hết hàng.",
    requiredTables: ["material_categories", "materials", "stock_tickets", "stock_ticket_items", "stock_movements", "inventory_files"],
    requiredActions: ["src/actions/inventory.ts"],
  },
  {
    id: "suppliers",
    label: "Nhà cung cấp",
    href: ROUTES.ERP.SUPPLIERS,
    icon: Truck,
    group: "inventory",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "suppliers.view",
    description: "Danh sách nhà cung cấp — nền tảng cho công nợ NCC và kho vật tư.",
    requiredTables: ["suppliers"],
    requiredActions: ["src/actions/suppliers.ts"],
  },

  // ── Tài chính & Công nợ ── Phase 1
  {
    id: "receipts",
    label: "Phiếu thu",
    href: ROUTES.ERP.RECEIPTS,
    icon: ArrowDownToLine,
    group: "finance",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "receipts.view",
    description: "Quản lý phiếu thu, tự động trừ công nợ khách hàng.",
    requiredTables: ["receipts", "finance_files", "customer_debts"],
    requiredActions: ["src/actions/finance.ts"],
  },
  {
    id: "payments",
    label: "Phiếu chi",
    href: ROUTES.ERP.PAYMENTS,
    icon: ArrowUpFromLine,
    group: "finance",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "payments.view",
    description: "Quản lý phiếu chi, tự động cập nhật công nợ nhà cung cấp.",
    requiredTables: ["payments", "finance_files", "supplier_debts"],
    requiredActions: ["src/actions/finance.ts"],
  },
  {
    id: "debts",
    label: "Công nợ",
    href: ROUTES.ERP.DEBTS,
    icon: Wallet,
    group: "finance",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "customer_debts.view",
    description: "Công nợ khách hàng và nhà cung cấp, cảnh báo quá hạn.",
    requiredTables: ["customer_debts", "supplier_debts"],
    requiredActions: ["src/actions/finance.ts", "src/actions/debts.ts"],
  },
  {
    id: "vat_invoices",
    label: "Hóa đơn VAT",
    href: ROUTES.ERP.VAT_INVOICES,
    icon: Receipt,
    group: "finance",
    phase: 2,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "vat_invoices.view",
    description: "Lưu hóa đơn VAT đầu ra/đầu vào, liên kết khách hàng.",
    requiredTables: ["vat_invoices"],
    requiredActions: ["src/actions/vat-invoices.ts"],
  },

  // ── Bán hàng Online ── Phase 3
  {
    id: "online_products",
    label: "Sản phẩm Online",
    href: ROUTES.ERP.ONLINE_SALES.PRODUCTS,
    icon: ShoppingCart,
    group: "online_sales",
    phase: 3,
    status: "planned",
    enabled: false,
    visibleInSidebar: false,
    permission: "products.view",
    description: "SKU, biến thể màu/size/chất liệu, giá bán/giá vốn.",
    requiredTables: ["products", "product_variants"],
  },
  {
    id: "online_orders",
    label: "Đơn hàng Online",
    href: ROUTES.ERP.ONLINE_SALES.ORDERS,
    icon: ListOrdered,
    group: "online_sales",
    phase: 3,
    status: "planned",
    enabled: false,
    visibleInSidebar: false,
    permission: "online_orders.view",
    description: "Đơn hàng từ Facebook/Zalo/Website/TikTok.",
    requiredTables: ["online_orders", "online_order_items", "online_order_payments"],
  },
  {
    id: "facebook_connect",
    label: "Kết nối Facebook",
    href: ROUTES.ERP.OMNICHANNEL.FACEBOOK,
    icon: Share2,
    group: "online_sales",
    phase: 3,
    status: "blocked",
    enabled: false,
    visibleInSidebar: false,
    permission: "omnichannel.facebook.manage",
    description: "Đồng bộ tin nhắn/bình luận/lead từ Fanpage. Cần Page Access Token thật từ khách hàng.",
    requiredTables: ["channel_accounts", "conversations", "conversation_messages"],
    requiredActions: ["src/app/api/webhooks/facebook/route.ts (chỉ nhận webhook, chưa xử lý)"],
  },
  {
    id: "zalo_connect",
    label: "Kết nối Zalo OA",
    href: ROUTES.ERP.OMNICHANNEL.ZALO,
    icon: MessageCircle,
    group: "online_sales",
    phase: 3,
    status: "blocked",
    enabled: false,
    visibleInSidebar: false,
    permission: "omnichannel.zalo.manage",
    description: "Đồng bộ khách hàng/tin nhắn từ Zalo OA. Cần Zalo OA token thật từ khách hàng.",
    requiredTables: ["channel_accounts", "conversations", "conversation_messages"],
    requiredActions: ["src/app/api/webhooks/zalo/route.ts (chỉ nhận webhook, chưa xử lý)"],
  },

  // ── Hệ thống ── Phase 1
  {
    id: "settings",
    label: "Cài đặt",
    href: ROUTES.ERP.SETTINGS.OVERVIEW,
    icon: Settings,
    group: "system",
    phase: 1,
    status: "ready",
    enabled: true,
    visibleInSidebar: true,
    permission: "settings.view",
    description: "Cài đặt hệ thống, công ty, người dùng, vai trò, tài chính, kho, bảo mật.",
    requiredTables: ["settings", "user_preferences"],
  },
  {
    id: "users",
    label: "Người dùng",
    href: ROUTES.ERP.SETTINGS.USERS,
    icon: Users,
    group: "system",
    phase: 1,
    status: "in_progress",
    enabled: true,
    visibleInSidebar: false, // truy cập qua hub /settings, không cần link riêng trên sidebar chính
    permission: "settings.users.view",
    description: "CRUD người dùng, gán vai trò.",
    requiredTables: ["users", "user_roles"],
    requiredActions: ["src/actions/users.ts"],
  },
  {
    id: "roles",
    label: "Vai trò / Phân quyền",
    href: ROUTES.ERP.SETTINGS.ROLES,
    icon: FileSignature,
    group: "system",
    phase: 1,
    status: "in_progress",
    enabled: true,
    visibleInSidebar: false,
    permission: "settings.roles.view",
    description: "CRUD vai trò, gán quyền hạn.",
    requiredTables: ["roles", "permissions", "role_permissions"],
    requiredActions: ["src/actions/roles.ts"],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

/** Module hiện trong sidebar chính (Phase 1 luôn hiện; Phase 2+ chỉ hiện khi visibleInSidebar=true). */
export function getSidebarModules(): ModuleDefinition[] {
  return MODULES_CONFIG.filter((m) => m.enabled && m.visibleInSidebar);
}

/** Group cho sidebar, kèm phase để render badge "Giai đoạn 2/3" khi cần. */
export function getGroupedCoreModules(): {
  group: ModuleGroup;
  label: string;
  items: ModuleDefinition[];
}[] {
  const visible = getSidebarModules();
  const groups: ModuleGroup[] = [
    "overview",
    "crm_sales",
    "documents",
    "finance",
    "operations",
    "inventory",
    "online_sales",
    "system",
  ];

  return groups
    .map((g) => ({
      group: g,
      label: MODULE_GROUP_LABELS[g],
      items: visible.filter((m) => m.group === g),
    }))
    .filter((g) => g.items.length > 0);
}

/** Toàn bộ registry — dùng cho trang /settings hoặc tài liệu nội bộ, không lọc gì cả. */
export function getAllModules(): ModuleDefinition[] {
  return MODULES_CONFIG;
}

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES_CONFIG.find((m) => m.id === id);
}
