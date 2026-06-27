// ─── Paginated Response ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── API Response ───────────────────────────────────────────────────
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Query Params ───────────────────────────────────────────────────
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

// ─── User with roles ────────────────────────────────────────────────
export interface CurrentUser {
  id: string;
  companyId: string | null;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  permissions: string[];
}

// ─── Dashboard Stats ────────────────────────────────────────────────
export interface DashboardStats {
  totalCustomers: number;
  totalProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  totalDebt: number;
  activeProjects: number;
  pendingQuotations: number;
  overdueDebts: number;
}

// ─── Select Option ──────────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
}
