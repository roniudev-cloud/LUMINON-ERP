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
import { ProjectForm } from "./project-form";

interface ProjectDialogProps {
  customers: { id: string; name: string }[];
  users: { id: string; fullName: string; roles: string[] }[];
  trigger?: React.ReactNode;
}

export function ProjectDialog({
  customers,
  users,
  trigger,
}: ProjectDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tạo công trình
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[95vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>Tạo công trình mới</DialogTitle>
        </DialogHeader>
        <ProjectForm
          customers={customers}
          users={users}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
