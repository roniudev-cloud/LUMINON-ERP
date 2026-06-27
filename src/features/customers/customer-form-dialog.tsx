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
import { CustomerForm } from "./customer-form";

interface CustomerDialogProps {
  lookups: {
    sources: { id: string; name: string }[];
    statuses: { id: string; name: string }[];
    assignees: { id: string; fullName: string }[];
  };
  initialData?: any;
  trigger?: React.ReactNode;
}

export function CustomerDialog({
  lookups,
  initialData,
  trigger,
}: CustomerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[95vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>
            {initialData ? "Sửa khách hàng" : "Thêm mới khách hàng"}
          </DialogTitle>
        </DialogHeader>
        <CustomerForm
          initialData={initialData}
          sources={lookups.sources}
          statuses={lookups.statuses}
          assignees={lookups.assignees}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
