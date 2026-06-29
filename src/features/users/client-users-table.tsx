"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MobileEntityCard, MobileEntityCardList } from "@/components/shared/mobile-entity-card";
import { Search, Shield, Lock, Unlock, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toggleUserStatus } from "@/actions/users";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string | Date;
  roles: string[];
}

export function ClientUsersTable({ data, currentUserId }: { data: UserRow[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toggleTarget, setToggleTarget] = useState<UserRow | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const allRoles = useMemo(() => Array.from(new Set(data.flatMap((u) => u.roles))).sort(), [data]);

  const filtered = data.filter((u) => {
    if (roleFilter !== "all" && !u.roles.includes(roleFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  async function handleConfirmToggle() {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      const result = await toggleUserStatus(toggleTarget.id);
      toast.success(result.isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      setToggleTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm tên hoặc email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {allRoles.map((r) => (<SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <table className="hidden md:table w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="p-4 font-medium">Nhân viên</th>
            <th className="p-4 font-medium">Vai trò (Role)</th>
            <th className="p-4 font-medium">Trạng thái</th>
            <th className="p-4 font-medium">Ngày tham gia</th>
            <th className="p-4 font-medium text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Không tìm thấy nhân viên nào.</td></tr>
          ) : (
            filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span key={role} className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full w-fit text-xs font-semibold uppercase">
                          <Shield className="h-3 w-3 text-blue-600" />
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border rounded-full w-fit text-xs font-medium text-slate-500">
                        <Shield className="h-3 w-3 text-slate-400" />
                        Chưa phân quyền
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {user.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Hoạt động</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">Đã khóa</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/settings/users/${user.id}/edit`}><Edit className="h-3.5 w-3.5 mr-1.5" /> Chỉnh sửa</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={user.id === currentUserId}
                    title={user.id === currentUserId ? "Không thể tự khóa tài khoản của chính mình" : undefined}
                    className={user.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                    onClick={() => setToggleTarget(user)}
                  >
                    {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="md:hidden p-3">
        <MobileEntityCardList empty={filtered.length === 0}>
          {filtered.map((user) => (
            <MobileEntityCard
              key={user.id}
              title={user.fullName}
              subtitle={user.email}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={user.id === currentUserId}
                  className={user.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                  onClick={(e) => { e.stopPropagation(); setToggleTarget(user); }}
                >
                  {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              }
              fields={[
                {
                  label: "Vai trò",
                  value: (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {user.roles.length > 0 ? user.roles.map((role) => (
                        <span key={role} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-semibold uppercase">{role}</span>
                      )) : <span className="text-xs text-muted-foreground">Chưa phân quyền</span>}
                    </div>
                  ),
                },
                {
                  label: "Trạng thái",
                  value: user.isActive
                    ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Hoạt động</span>
                    : <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">Đã khóa</span>,
                },
                { label: "Ngày tham gia", value: formatDate(user.createdAt) },
                { label: "Chỉnh sửa", value: <Link href={`/settings/users/${user.id}/edit`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}><Edit className="h-3.5 w-3.5 inline mr-1" />Sửa</Link> },
              ]}
            />
          ))}
        </MobileEntityCardList>
      </div>

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
        description={`Bạn có chắc chắn muốn ${toggleTarget?.isActive ? "khóa" : "mở khóa"} tài khoản "${toggleTarget?.fullName}"?`}
        variant={toggleTarget?.isActive ? "destructive" : "default"}
        onConfirm={handleConfirmToggle}
        loading={isToggling}
      />
    </div>
  );
}
