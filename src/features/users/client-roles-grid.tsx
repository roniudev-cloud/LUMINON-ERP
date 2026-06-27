"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ShieldCheck, Trash2 } from "lucide-react";
import { EditRolePermissionsDialog } from "./edit-role-permissions-dialog";
import { deleteRole } from "@/actions/roles";
import { toast } from "sonner";

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: { id: string; code: string; name: string }[];
}

export function ClientRolesGrid({ roles }: { roles: RoleItem[] }) {
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deletingRole) return;
    setIsDeleting(true);
    try {
      await deleteRole(deletingRole.id);
      toast.success("Đã xóa vai trò");
      setDeletingRole(null);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                <Badge variant={role.isSystem ? "secondary" : "outline"}>{role.userCount} User(s)</Badge>
              </div>
              {role.description && <CardDescription>{role.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <h4 className="text-sm font-medium mb-3">Quyền hạn ({role.permissions.length}):</h4>
              <div className="flex-1">
                {role.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 8).map((perm) => (
                      <Badge key={perm.id} variant="outline" className="text-xs font-normal bg-muted/50 border-muted" title={perm.name}>
                        {perm.code}
                      </Badge>
                    ))}
                    {role.permissions.length > 8 && (
                      <Badge variant="outline" className="text-xs font-normal">+{role.permissions.length - 8} khác</Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chưa có quyền nào được cấp.</p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => setEditingRole(role)}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Sửa quyền
                </Button>
                {!role.isSystem && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeletingRole(role)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingRole && (
        <EditRolePermissionsDialog
          open={!!editingRole}
          onOpenChange={(open) => !open && setEditingRole(null)}
          roleId={editingRole.id}
          roleName={editingRole.name}
          currentPermissionIds={editingRole.permissions.map((p) => p.id)}
        />
      )}

      <ConfirmDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        title="Xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò "${deletingRole?.name}"? Vai trò đang được gán cho người dùng sẽ không thể xóa.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
