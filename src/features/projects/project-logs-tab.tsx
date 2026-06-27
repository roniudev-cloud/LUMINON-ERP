"use client";

import { useTransition, useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createProjectLog } from "@/actions/projects";
import { toast } from "sonner";
import { Loader2, Plus, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

export function ProjectLogsTab({ project, logs }: { project: any; logs: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    phase: "in_progress" as any,
    title: "",
    content: "",
    issues: "",
    proposal: "",
    status: "resolved" as any,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createProjectLog({ ...formData, projectId: project.id, images: [] });
        toast.success("Đã thêm nhật ký");
        setOpen(false);
        setFormData({ ...formData, title: "", content: "", issues: "", proposal: "" });
      } catch (err: any) {
        toast.error("Lỗi", { description: err.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Nhật ký thi công</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Thêm nhật ký</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm nhật ký mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày</label>
                  <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giai đoạn</label>
                  <Select value={formData.phase} onValueChange={v => setFormData({...formData, phase: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_construction">Trước thi công</SelectItem>
                      <SelectItem value="in_progress">Trong thi công</SelectItem>
                      <SelectItem value="materials">Vật tư</SelectItem>
                      <SelectItem value="issues">Phát sinh</SelectItem>
                      <SelectItem value="acceptance">Nghiệm thu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Đổ bê tông móng" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nội dung / Công việc đã làm</label>
                <Textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="h-20" />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-600">Vấn đề phát sinh (Nếu có)</label>
                  <Textarea value={formData.issues} onChange={e => setFormData({...formData, issues: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Đề xuất xử lý</label>
                  <Textarea value={formData.proposal} onChange={e => setFormData({...formData, proposal: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu nhật ký
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 border-l-2 border-muted ml-3 pl-6 relative">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">Chưa có nhật ký nào được ghi nhận.</p>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="relative mb-8 bg-card border rounded-xl p-5 shadow-sm">
              <div className="absolute -left-[35px] top-4 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    {log.title}
                    <StatusBadge status={log.phase} />
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{log.date}</span>
                    <span>•</span>
                    <span>Tạo bởi {log.user?.fullName}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm whitespace-pre-wrap">{log.content}</div>

              {(log.issues || log.proposal) && (
                <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-4 text-sm bg-orange-50/50 p-3 rounded-lg dark:bg-orange-950/20">
                  {log.issues && (
                    <div>
                      <span className="font-semibold text-orange-700 dark:text-orange-400">Vấn đề: </span>
                      <span>{log.issues}</span>
                    </div>
                  )}
                  {log.proposal && (
                    <div>
                      <span className="font-semibold text-blue-700 dark:text-blue-400">Đề xuất: </span>
                      <span>{log.proposal}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
