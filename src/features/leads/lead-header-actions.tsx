"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LeadFormDialog } from "./lead-form-dialog";

export function LeadHeaderActions({
  sources,
  assignees,
}: {
  sources: { id: string; name: string }[];
  assignees: { id: string; fullName: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Thêm mới
      </Button>
      
      <LeadFormDialog
        open={open}
        onOpenChange={setOpen}
        sources={sources}
        assignees={assignees}
      />
    </>
  );
}
