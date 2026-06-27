"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { UserPlus, Trash2, Wallet } from "lucide-react";
import { assignWorkerToProject, removeWorkerFromProject } from "@/actions/workers";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";

interface ProjectWorkersTabProps {
  projectId: string;
  assignments: any[];
  workerOptions: { id: string; code: string; name: string }[];
  costs: Record<string, number>;
}

export function ProjectWorkersTab({ projectId, assignments, workerOptions, costs }: ProjectWorkersTabProps) {
  const router = useRouter();
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [roleNote, setRoleNote] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const assignedIds = new Set(assignments.map((a) => a.workerId));
  const availableWorkers = workerOptions.filter((w) => !assignedIds.has(w.id));

  async function handleAssign() {
    if (!selectedWorkerId) {
      toast.error("Vui lòng chọn thợ");
      return;
    }
    setIsAssigning(true);
    try {
      await assignWorkerToProject(projectId, selectedWorkerId, roleNote || undefined);
      toast.success("Đã thêm thợ vào công trình");
      setSelectedWorkerId("");
      setRoleNote("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setIsRemoving(true);
    try {
      await removeWorkerFromProject(projectId, removeTarget.workerId);
      toast.success("Đã gỡ thợ khỏi công trình");
      setRemoveTarget(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 border rounded-lg p-3 bg-muted/30">
        <div className="flex-1 min-w-[180px]">
          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
            <SelectTrigger><SelectValue placeholder="Chọn thợ để thêm vào công trình" /></SelectTrigger>
            <SelectContent>
              {availableWorkers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Không còn thợ nào để thêm</div>
              ) : (
                availableWorkers.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name} ({w.code})</SelectItem>))
              )}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Vai trò (VD: Tổ trưởng, Thợ điện...)"
          value={roleNote}
          onChange={(e) => setRoleNote(e.target.value)}
          className="flex-1 min-w-[160px]"
        />
        <Button onClick={handleAssign} disabled={isAssigning || !selectedWorkerId}>
          <UserPlus className="mr-2 h-4 w-4" /> Thêm
        </Button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Chưa gán thợ nào cho công trình này.</p>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div key={a.workerId} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <Link href={`/workers/${a.worker.id}`} className="font-medium hover:underline hover:text-primary">
                  {a.worker.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {a.worker.code} · {a.worker.role?.name || "Chưa phân loại"}
                  {a.role && ` · ${a.role}`}
                  {" · "}{formatVND(a.worker.dailyRate)}/ngày
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Đã trả cho công trình này</p>
                  <p className="text-sm font-semibold">{formatVND(costs[a.workerId] || 0)}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/workers/${a.worker.id}`}>
                    <Wallet className="mr-1.5 h-3.5 w-3.5" /> Chốt lương
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setRemoveTarget(a)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Gỡ thợ khỏi công trình"
        description={`Gỡ "${removeTarget?.worker?.name}" khỏi danh sách thợ tham gia công trình này?`}
        variant="destructive"
        onConfirm={handleConfirmRemove}
        loading={isRemoving}
      />
    </div>
  );
}
