"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PaymentForm } from "./payment-form";

interface PaymentDialogProps {
  projects: { id: string; name: string; code: string }[];
  suppliers?: { id: string; name: string; code: string }[];
  trigger?: React.ReactNode;
}

export function PaymentDialog({
  projects,
  suppliers = [],
  trigger,
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive">
            <Plus className="mr-2 h-4 w-4" /> Lập phiếu chi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[95vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>Lập phiếu chi mới</DialogTitle>
        </DialogHeader>
        <PaymentForm
          projects={projects}
          suppliers={suppliers}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
