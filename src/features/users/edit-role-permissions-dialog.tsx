"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck } from "lucide-react";
import { getAllPermissions, updateRolePermissions } from "@/actions/roles";
import { toast } from "sonner";

interface EditRolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
  currentPermissionIds: string[];
}

export function EditRolePermissionsDialog({ open, onOpenChange, roleId, roleName, currentPermissionIds }: EditRolePermissionsDialogProps) {
  const [groups, setGroups] = useState<{ module: string; items: { id: string; code: string; name: string }[] }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      setLoading(true);
      getAllPermissions().then((data) => {
        setGroups(data);
        setSelected(new Set(currentPermissionIds));
        setLoading(false);
      });
    }, 0);
    return () => clearTimeout(handle);
  }, [open, currentPermissionIds]);


  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleModule(items: { id: string }[], checkAll: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of items) {
        if (checkAll) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateRolePermissions(roleId, Array.from(selected));
        toast.success("Đã cập nhật quyền hạn");
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 capitalize"><ShieldCheck className="h-5 w-5" /> Quyền hạn: {roleName}</DialogTitle>
          <DialogDescription>Chọn các quyền mà vai trò này được phép thực hiện.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const allChecked = group.items.every((it) => selected.has(it.id));
              return (
                <div key={group.module} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold uppercase text-muted-foreground">{group.module}</span>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox checked={allChecked} onCheckedChange={(c) => toggleModule(group.items, !!c)} />
                      Chọn tất cả
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
                        <span className="truncate" title={item.code}>{item.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={isPending || loading}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu quyền hạn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
