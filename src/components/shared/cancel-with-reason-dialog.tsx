"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CancelWithReasonDialogProps {
  triggerLabel: string;
  title: string;
  description: string;
  onConfirm: (reason: string) => Promise<void>;
  successMessage: string;
}

export function CancelWithReasonDialog({ triggerLabel, title, description, onConfirm, successMessage }: CancelWithReasonDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy");
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      toast.success(successMessage);
      setOpen(false);
      setReason("");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
          <Ban className="mr-2 h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Lý do hủy *</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Khách hàng đổi ý, không còn nhu cầu thi công..."
            className="h-24"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isSubmitting}>Đóng</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận hủy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
