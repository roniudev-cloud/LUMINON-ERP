// ─── Roles ──────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales",
  ACCOUNTANT: "accountant",
  PRODUCTION_MANAGER: "production_manager",
  CONSTRUCTION_TEAM: "construction_team",
  WAREHOUSE_STAFF: "warehouse_staff",
  VIEWER: "viewer",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// ─── Permission Codes ───────────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_VIEW_FINANCE: "dashboard.view_finance",
  DASHBOARD_VIEW_PROFIT: "dashboard.view_profit",

  // Customers
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_VIEW_OWN: "customers.view_own",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_UPDATE: "customers.update",
  CUSTOMERS_DELETE: "customers.delete",

  // Leads
  LEADS_VIEW: "leads.view",
  LEADS_CREATE: "leads.create",
  LEADS_UPDATE: "leads.update",
  LEADS_DELETE: "leads.delete",

  // Quotations
  QUOTATIONS_VIEW: "quotations.view",
  QUOTATIONS_VIEW_OWN: "quotations.view_own",
  QUOTATIONS_CREATE: "quotations.create",
  QUOTATIONS_UPDATE: "quotations.update",
  QUOTATIONS_DELETE: "quotations.delete",

  // Contracts
  CONTRACTS_VIEW: "contracts.view",
  CONTRACTS_VIEW_OWN: "contracts.view_own",
  CONTRACTS_CREATE: "contracts.create",
  CONTRACTS_UPDATE: "contracts.update",
  CONTRACTS_DELETE: "contracts.delete",

  // Projects
  PROJECTS_VIEW: "projects.view",
  PROJECTS_VIEW_OWN: "projects.view_own",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_UPDATE: "projects.update",
  PROJECTS_DELETE: "projects.delete",

  // Tasks
  TASKS_VIEW: "tasks.view",
  TASKS_CREATE: "tasks.create",
  TASKS_UPDATE: "tasks.update",
  TASKS_DELETE: "tasks.delete",
  TASKS_ASSIGN: "tasks.assign",

  // Workers
  WORKERS_VIEW: "workers.view",
  WORKERS_CREATE: "workers.create",
  WORKERS_UPDATE: "workers.update",
  WORKERS_DELETE: "workers.delete",

  // Acceptance / Liquidation reports
  ACCEPTANCE_REPORTS_VIEW: "acceptance_reports.view",
  ACCEPTANCE_REPORTS_CREATE: "acceptance_reports.create",
  ACCEPTANCE_REPORTS_UPDATE: "acceptance_reports.update",
  ACCEPTANCE_REPORTS_DELETE: "acceptance_reports.delete",
  LIQUIDATION_REPORTS_VIEW: "liquidation_reports.view",
  LIQUIDATION_REPORTS_CREATE: "liquidation_reports.create",
  LIQUIDATION_REPORTS_UPDATE: "liquidation_reports.update",
  LIQUIDATION_REPORTS_DELETE: "liquidation_reports.delete",

  // Finance
  RECEIPTS_VIEW: "receipts.view",
  RECEIPTS_CREATE: "receipts.create",
  RECEIPTS_UPDATE: "receipts.update",
  RECEIPTS_DELETE: "receipts.delete",
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_CREATE: "payments.create",
  PAYMENTS_UPDATE: "payments.update",
  PAYMENTS_DELETE: "payments.delete",
  CUSTOMER_DEBTS_VIEW: "customer_debts.view",
  SUPPLIER_DEBTS_VIEW: "supplier_debts.view",

  // Reports (Phase 2 but keep codes)
  REPORTS_VIEW: "reports.view",
  REPORTS_REVENUE_VIEW: "reports.revenue.view",
  REPORTS_EXPENSES_VIEW: "reports.expenses.view",
  REPORTS_PROFIT_VIEW: "reports.profit.view",
  REPORTS_PROJECTS_VIEW: "reports.projects.view",
  REPORTS_CUSTOMERS_VIEW: "reports.customers.view",
  REPORTS_EMPLOYEES_VIEW: "reports.employees.view",
  REPORTS_DEBTS_VIEW: "reports.debts.view",
  REPORTS_EXPORT: "reports.export",
  PROFIT_VIEW: "profit.view",
  FINANCE_VIEW: "finance.view",

  // Settings & System
  SETTINGS_VIEW: "settings.view",
  SETTINGS_COMPANY_VIEW: "settings.company.view",
  SETTINGS_COMPANY_UPDATE: "settings.company.update",
  SETTINGS_USERS_VIEW: "settings.users.view",
  SETTINGS_USERS_CREATE: "settings.users.create",
  SETTINGS_USERS_UPDATE: "settings.users.update",
  SETTINGS_USERS_DISABLE: "settings.users.disable",
  SETTINGS_ROLES_VIEW: "settings.roles.view",
  SETTINGS_ROLES_CREATE: "settings.roles.create",
  SETTINGS_ROLES_UPDATE: "settings.roles.update",
  SETTINGS_ROLES_DELETE: "settings.roles.delete",
  SETTINGS_PERMISSIONS_VIEW: "settings.permissions.view",
  SETTINGS_MANAGE: "settings.manage",

  // Admin
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",

  // Phase 2 (keep for compatibility)
  PROJECT_COSTS_VIEW: "project_costs.view",
  PROJECT_COSTS_CREATE: "project_costs.create",
  PROJECT_COSTS_VIEW_PROFIT: "project_costs.view_profit",
  VAT_INVOICES_VIEW: "vat_invoices.view",
  VAT_INVOICES_CREATE: "vat_invoices.create",
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_CREATE: "inventory.create",
  INVENTORY_UPDATE: "inventory.update",
  INVENTORY_DELETE: "inventory.delete",
  INVENTORY_STOCK_IN_VIEW: "inventory.stock_in.view",
  INVENTORY_STOCK_IN_CREATE: "inventory.stock_in.create",
  INVENTORY_STOCK_OUT_VIEW: "inventory.stock_out.view",
  INVENTORY_STOCK_OUT_CREATE: "inventory.stock_out.create",
  INVENTORY_MOVEMENTS_VIEW: "inventory.movements.view",
  SUPPLIERS_VIEW: "suppliers.view",
  SUPPLIERS_CREATE: "suppliers.create",
  SUPPLIERS_UPDATE: "suppliers.update",
  SUPPLIERS_DELETE: "suppliers.delete",
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",
  ONLINE_ORDERS_VIEW: "online_orders.view",
  ONLINE_ORDERS_CREATE: "online_orders.create",
  ONLINE_ORDERS_UPDATE: "online_orders.update",
  DOCUMENTS_VIEW: "documents.view",
  DOCUMENTS_EXPORT_PDF: "documents.export_pdf",
  DOCUMENTS_EXPORT_WORD: "documents.export_word",
  DOCUMENTS_EXPORT_EXCEL: "documents.export_excel",
  DOCUMENT_TEMPLATES_VIEW: "document_templates.view",
  DOCUMENT_TEMPLATES_CREATE: "document_templates.create",
  DOCUMENT_TEMPLATES_UPDATE: "document_templates.update",
  DOCUMENT_TEMPLATES_DELETE: "document_templates.delete",
  OMNICHANNEL_VIEW: "omnichannel.view",
  OMNICHANNEL_INBOX_VIEW: "omnichannel.inbox.view",
  OMNICHANNEL_INBOX_UPDATE: "omnichannel.inbox.update",
  OMNICHANNEL_CONVERSATIONS_ASSIGN: "omnichannel.conversations.assign",
  OMNICHANNEL_CONVERSATIONS_CLOSE: "omnichannel.conversations.close",
  OMNICHANNEL_LEADS_CREATE: "omnichannel.leads.create",
  OMNICHANNEL_SETTINGS_VIEW: "omnichannel.settings.view",
  OMNICHANNEL_SETTINGS_UPDATE: "omnichannel.settings.update",
  OMNICHANNEL_WEBHOOKS_VIEW: "omnichannel.webhooks.view",
  OMNICHANNEL_WEBHOOKS_RETRY: "omnichannel.webhooks.retry",
  OMNICHANNEL_FACEBOOK_MANAGE: "omnichannel.facebook.manage",
  OMNICHANNEL_ZALO_MANAGE: "omnichannel.zalo.manage",
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_UPDATE: "notifications.update",
  REMINDERS_VIEW: "reminders.view",
  REMINDERS_CREATE: "reminders.create",
  REMINDERS_UPDATE: "reminders.update",
  REMINDERS_DELETE: "reminders.delete",
  CALENDAR_VIEW: "calendar.view",
  CALENDAR_CREATE: "calendar.create",
  CALENDAR_UPDATE: "calendar.update",
  CALENDAR_DELETE: "calendar.delete",
  REPORTS_INVENTORY_VIEW: "reports.inventory.view",
  REPORTS_ONLINE_SALES_VIEW: "reports.online_sales.view",
  SETTINGS_FINANCE_VIEW: "settings.finance.view",
  SETTINGS_FINANCE_UPDATE: "settings.finance.update",
  SETTINGS_SALES_VIEW: "settings.sales.view",
  SETTINGS_SALES_UPDATE: "settings.sales.update",
  SETTINGS_PROJECTS_VIEW: "settings.projects.view",
  SETTINGS_PROJECTS_UPDATE: "settings.projects.update",
  SETTINGS_INVENTORY_VIEW: "settings.inventory.view",
  SETTINGS_INVENTORY_UPDATE: "settings.inventory.update",
  SETTINGS_DOCUMENTS_VIEW: "settings.documents.view",
  SETTINGS_DOCUMENTS_UPDATE: "settings.documents.update",
  SETTINGS_NOTIFICATIONS_VIEW: "settings.notifications.view",
  SETTINGS_NOTIFICATIONS_UPDATE: "settings.notifications.update",
  SETTINGS_SECURITY_VIEW: "settings.security.view",
  SETTINGS_SECURITY_UPDATE: "settings.security.update",
  AUDIT_LOGS_VIEW: "audit_logs.view",
  AUDIT_LOGS_EXPORT: "audit_logs.export",
  BACKUPS_VIEW: "backups.view",
  BACKUPS_CREATE: "backups.create",
  PROFILE_VIEW: "profile.view",
  PROFILE_UPDATE: "profile.update",
  PROFILE_SECURITY_UPDATE: "profile.security.update",
  PROFILE_PREFERENCES_UPDATE: "profile.preferences.update",
  PROFILE_ACTIVITY_VIEW: "profile.activity.view",
  PROFILE_NOTIFICATIONS_UPDATE: "profile.notifications.update",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Default Role → Permissions Mapping ─────────────────────────────
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_VIEW_FINANCE,
    PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMERS_UPDATE, PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.LEADS_VIEW, PERMISSIONS.LEADS_CREATE, PERMISSIONS.LEADS_UPDATE, PERMISSIONS.LEADS_DELETE,
    PERMISSIONS.QUOTATIONS_VIEW, PERMISSIONS.QUOTATIONS_CREATE, PERMISSIONS.QUOTATIONS_UPDATE, PERMISSIONS.QUOTATIONS_DELETE,
    PERMISSIONS.CONTRACTS_VIEW, PERMISSIONS.CONTRACTS_CREATE, PERMISSIONS.CONTRACTS_UPDATE, PERMISSIONS.CONTRACTS_DELETE,
    PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PROJECTS_CREATE, PERMISSIONS.PROJECTS_UPDATE, PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE, PERMISSIONS.TASKS_DELETE, PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.WORKERS_VIEW, PERMISSIONS.WORKERS_CREATE, PERMISSIONS.WORKERS_UPDATE, PERMISSIONS.WORKERS_DELETE,
    PERMISSIONS.ACCEPTANCE_REPORTS_VIEW, PERMISSIONS.ACCEPTANCE_REPORTS_CREATE, PERMISSIONS.ACCEPTANCE_REPORTS_UPDATE, PERMISSIONS.ACCEPTANCE_REPORTS_DELETE,
    PERMISSIONS.LIQUIDATION_REPORTS_VIEW, PERMISSIONS.LIQUIDATION_REPORTS_CREATE, PERMISSIONS.LIQUIDATION_REPORTS_UPDATE, PERMISSIONS.LIQUIDATION_REPORTS_DELETE,
    PERMISSIONS.RECEIPTS_VIEW, PERMISSIONS.RECEIPTS_CREATE, PERMISSIONS.RECEIPTS_UPDATE,
    PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_CREATE, PERMISSIONS.PAYMENTS_UPDATE,
    PERMISSIONS.CUSTOMER_DEBTS_VIEW, PERMISSIONS.SUPPLIER_DEBTS_VIEW,
    PERMISSIONS.SUPPLIERS_VIEW, PERMISSIONS.SUPPLIERS_CREATE, PERMISSIONS.SUPPLIERS_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_COMPANY_VIEW,
  ],

  [ROLES.SALES]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.LEADS_VIEW, PERMISSIONS.LEADS_CREATE, PERMISSIONS.LEADS_UPDATE,
    PERMISSIONS.QUOTATIONS_VIEW_OWN, PERMISSIONS.QUOTATIONS_CREATE, PERMISSIONS.QUOTATIONS_UPDATE,
    PERMISSIONS.CONTRACTS_VIEW, PERMISSIONS.CONTRACTS_CREATE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.RECEIPTS_VIEW,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_VIEW_FINANCE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.RECEIPTS_VIEW, PERMISSIONS.RECEIPTS_CREATE, PERMISSIONS.RECEIPTS_UPDATE, PERMISSIONS.RECEIPTS_DELETE,
    PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_CREATE, PERMISSIONS.PAYMENTS_UPDATE, PERMISSIONS.PAYMENTS_DELETE,
    PERMISSIONS.CUSTOMER_DEBTS_VIEW, PERMISSIONS.SUPPLIER_DEBTS_VIEW,
    PERMISSIONS.SUPPLIERS_VIEW, PERMISSIONS.SUPPLIERS_CREATE, PERMISSIONS.SUPPLIERS_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FINANCE_VIEW,
  ],

  [ROLES.PRODUCTION_MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PROJECTS_CREATE, PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_UPDATE, PERMISSIONS.TASKS_DELETE, PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.WORKERS_VIEW, PERMISSIONS.WORKERS_CREATE, PERMISSIONS.WORKERS_UPDATE,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.ACCEPTANCE_REPORTS_VIEW, PERMISSIONS.ACCEPTANCE_REPORTS_CREATE, PERMISSIONS.ACCEPTANCE_REPORTS_UPDATE,
    PERMISSIONS.LIQUIDATION_REPORTS_VIEW, PERMISSIONS.LIQUIDATION_REPORTS_CREATE, PERMISSIONS.LIQUIDATION_REPORTS_UPDATE,
  ],

  [ROLES.CONSTRUCTION_TEAM]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROJECTS_VIEW_OWN,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.WORKERS_VIEW,
    PERMISSIONS.ACCEPTANCE_REPORTS_VIEW, PERMISSIONS.ACCEPTANCE_REPORTS_CREATE,
  ],

  [ROLES.WAREHOUSE_STAFF]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.CONTRACTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
  ],
};

// ─── Status Enums (Centralized) ─────────────────────────────────────

export const CUSTOMER_STATUS = [
  { value: "new", label: "Mới" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
] as const;

export const LEAD_STATUS = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "qualified", label: "Đủ điều kiện" },
  { value: "converted", label: "Đã chuyển đổi" },
  { value: "lost", label: "Đã mất" },
] as const;

export const QUOTE_STATUS = [
  { value: "draft", label: "Nháp" },
  { value: "sent", label: "Đã gửi" },
  { value: "reviewing", label: "Khách xem xét" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "converted", label: "Đã chuyển đổi" },
] as const;

export const CONTRACT_STATUS = [
  { value: "draft", label: "Nháp" },
  { value: "pending_sign", label: "Chờ ký" },
  { value: "signed", label: "Đã ký" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export const PROJECT_STATUS = [
  { value: "new", label: "Mới" },
  { value: "in_progress", label: "Đang thi công" },
  { value: "paused", label: "Tạm dừng" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export const TASK_STATUS = [
  { value: "new", label: "Mới" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export const TASK_PRIORITY = [
  { value: "low", label: "Thấp" },
  { value: "normal", label: "Bình thường" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
] as const;

export const WORKER_STATUS = [
  { value: "active", label: "Đang làm việc" },
  { value: "inactive", label: "Nghỉ việc" },
] as const;

export const DEBT_STATUS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "partial", label: "Thanh toán một phần" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "overdue", label: "Quá hạn" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "other", label: "Khác" },
] as const;

export const SUPPLIER_CATEGORIES = [
  { value: "alu", label: "Alu" },
  { value: "mica", label: "Mica" },
  { value: "inox", label: "Inox" },
  { value: "led", label: "LED" },
  { value: "son", label: "Sơn" },
  { value: "sat", label: "Sắt" },
  { value: "material", label: "Vật tư" },
  { value: "accessory", label: "Phụ kiện" },
  { value: "gia_cong", label: "Xưởng gia công" },
  { value: "van_chuyen", label: "Vận chuyển" },
  { value: "other", label: "Khác" },
] as const;

export const SUPPLIER_STATUS = [
  { value: "active", label: "Đang hợp tác" },
  { value: "inactive", label: "Ngừng hợp tác" },
] as const;

// ─── Status Colors ──────────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  new: "bg-blue-100 text-blue-700",
  sent: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  converted: "bg-purple-100 text-purple-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  pending_sign: "bg-yellow-100 text-yellow-700",
  signed: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  paused: "bg-orange-100 text-orange-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  half_day: "bg-yellow-100 text-yellow-700",
  design: "bg-blue-100 text-blue-700",
  design_review: "bg-yellow-100 text-yellow-700",
  production: "bg-purple-100 text-purple-700",
  waiting_materials: "bg-orange-100 text-orange-700",
  waiting_acceptance: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  warranty: "bg-cyan-100 text-cyan-700",
  low: "bg-slate-100 text-slate-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
  deposit: "bg-blue-100 text-blue-700",
  installment: "bg-indigo-100 text-indigo-700",
  final: "bg-green-100 text-green-700",
  extra: "bg-orange-100 text-orange-700",
  online_order: "bg-purple-100 text-purple-700",
  alu: "bg-slate-100 text-slate-700",
  mica: "bg-cyan-100 text-cyan-700",
  inox: "bg-zinc-100 text-zinc-700",
  led: "bg-yellow-100 text-yellow-700",
  son: "bg-pink-100 text-pink-700",
  sat: "bg-stone-100 text-stone-700",
  gia_cong: "bg-violet-100 text-violet-700",
  van_chuyen: "bg-sky-100 text-sky-700",
  accessory: "bg-lime-100 text-lime-700",
  issued: "bg-green-100 text-green-700",
  outbound: "bg-green-100 text-green-700",
  inbound: "bg-amber-100 text-amber-700",
  material: "bg-amber-100 text-amber-700",
  labor: "bg-teal-100 text-teal-700",
  subcontract: "bg-violet-100 text-violet-700",
  transport: "bg-sky-100 text-sky-700",
  utility: "bg-rose-100 text-rose-700",
  marketing: "bg-pink-100 text-pink-700",
  office: "bg-slate-100 text-slate-700",
  tool: "bg-lime-100 text-lime-700",
  other: "bg-gray-100 text-gray-700",
  default: "bg-gray-100 text-gray-700",
};

// ─── Status Labels (Vietnamese) ─────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  new: "Mới",
  sent: "Đã gửi",
  reviewing: "Khách xem xét",
  revising: "Cần chỉnh sửa",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  converted: "Đã chuyển đổi",
  active: "Đang hoạt động",
  inactive: "Không hoạt động",
  completed: "Hoàn thành",
  terminated: "Đã hủy",
  cancelled: "Đã hủy",
  pending: "Chờ xử lý",
  pending_sign: "Chờ ký",
  signed: "Đã ký",
  paid: "Đã thanh toán",
  overdue: "Quá hạn",
  partial: "Thanh toán một phần",
  in_progress: "Đang thực hiện",
  paused: "Tạm dừng",
  contacted: "Đã liên hệ",
  qualified: "Đủ điều kiện",
  lost: "Đã mất",
  present: "Có mặt",
  absent: "Vắng",
  half_day: "Nửa ngày",
  design: "Thiết kế",
  design_review: "Duyệt thiết kế",
  production: "Sản xuất",
  waiting_materials: "Chờ vật tư",
  waiting_acceptance: "Chờ nghiệm thu",
  accepted: "Đã nghiệm thu",
  warranty: "Bảo hành",
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
  urgent: "Khẩn cấp",
  deposit: "Đặt cọc",
  installment: "Trả góp",
  final: "Thanh toán cuối",
  extra: "Phát sinh",
  online_order: "Đặt hàng online",
  alu: "Alu",
  mica: "Mica",
  inox: "Inox",
  led: "LED",
  son: "Sơn",
  sat: "Sắt",
  gia_cong: "Xưởng gia công",
  van_chuyen: "Vận chuyển",
  accessory: "Phụ kiện",
  issued: "Đã xuất",
  outbound: "Đầu ra",
  inbound: "Đầu vào",
  material: "Vật tư",
  labor: "Nhân công",
  subcontract: "Thầu phụ",
  transport: "Vận chuyển",
  utility: "Điện nước",
  marketing: "Marketing",
  office: "Văn phòng",
  tool: "Công cụ dụng cụ",
  other: "Khác",
};

// ─── Units ──────────────────────────────────────────────────────────
export const UNITS = [
  "bộ", "cái", "chiếc", "m", "m²", "m³",
  "kg", "tấn", "lít", "thùng", "cuộn",
  "tấm", "thanh", "gói", "hộp",
];
