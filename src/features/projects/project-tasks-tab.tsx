"use client";

import { useTransition, useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createProjectTask } from "@/actions/projects";
import { toast } from "sonner";
import { Loader2, Plus, CheckCircle2, Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/data-table/data-table";

export function ProjectTasksTab({ project, tasks, users }: { project: any; tasks: any[]; users: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assignedToId: "",
    priority: "normal" as any,
    startDate: "",
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createProjectTask({ 
          ...formData, 
          projectId: project.id,
          status: "new",
          progress: 0
        });
        toast.success("Đã tạo công việc");
        setOpen(false);
        setFormData({ name: "", description: "", assignedToId: "", priority: "normal", startDate: "", dueDate: "" });
      } catch (err: any) {
        toast.error("Lỗi", { description: err.message });
      }
    });
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Tên công việc",
      cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "assignedTo.fullName",
      header: "Người phụ trách",
      cell: ({ row }: any) => row.original.assignedTo?.fullName || "—",
    },
    {
      accessorKey: "priority",
      header: "Ưu tiên",
      cell: ({ row }: any) => <StatusBadge status={row.original.priority} />,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "dueDate",
      header: "Hạn chót",
      cell: ({ row }: any) => row.original.dueDate || "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Danh sách Công việc</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Giao việc mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Giao công việc thi công</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên công việc</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Lắp đặt đường ống nước" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giao cho</label>
                  <Select value={formData.assignedToId} onValueChange={v => setFormData({...formData, assignedToId: v})}>
                    <SelectTrigger><SelectValue placeholder="Chọn người" /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Độ ưu tiên</label>
                  <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="normal">Bình thường</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="urgent">Gấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày bắt đầu</label>
                  <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hạn chót</label>
                  <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Giao việc
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-xl p-4 bg-card flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Clock className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold">{tasks.filter((t:any) => t.status !== "completed").length}</p>
            <p className="text-xs text-muted-foreground">Đang thực hiện</p>
          </div>
        </div>
        <div className="border rounded-xl p-4 bg-card flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold">{tasks.filter((t:any) => t.status === "completed").length}</p>
            <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={tasks} searchKey="name" searchPlaceholder="Tìm công việc..." />
    </div>
  );
}
