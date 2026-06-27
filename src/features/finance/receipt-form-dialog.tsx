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
import { ReceiptForm } from "./receipt-form";

interface ReceiptDialogProps {
  customers: { id: string; name: string }[];
  projects: { id: string; name: string; code: string }[];
  contracts: { id: string; code: string }[];
  trigger?: React.ReactNode;
}

export function ReceiptDialog({
  customers,
  projects,
  contracts,
  trigger,
}: ReceiptDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Lập phiếu thu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[95vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>Lập phiếu thu mới</DialogTitle>
        </DialogHeader>
        <ReceiptForm
          customers={customers}
          projects={projects}
          contracts={contracts}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
