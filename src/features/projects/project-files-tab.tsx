"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadProjectFile } from "@/actions/projects";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileIcon, ImageIcon, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export function ProjectFilesTab({ project, files }: { project: any; files: any[] }) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn", { description: "Vui lòng chọn file dưới 5MB để upload Base64 tạm thời." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      startTransition(async () => {
        try {
          await uploadProjectFile(project.id, base64String, file.name, "general");
          toast.success("Đã tải lên tệp");
        } catch (error: any) {
          toast.error("Lỗi tải lên", { description: error.message });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border border-dashed rounded-xl p-8 bg-card/50 text-center flex-col gap-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-full text-primary">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-medium text-lg">Tải lên tài liệu / Hình ảnh</h3>
          <p className="text-sm text-muted-foreground mt-1">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB cho Base64)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Chọn File
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">Chưa có tài liệu nào.</p>
        ) : (
          files.map((file: any) => (
            <div key={file.id} className="border rounded-xl overflow-hidden bg-card flex flex-col">
              {file.fileType === "image" ? (
                <div className="h-40 w-full bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.fileUrl} alt={file.fileName} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="h-40 w-full bg-muted flex items-center justify-center">
                  <FileIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-medium truncate" title={file.fileName}>{file.fileName}</p>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>{file.uploadedBy?.fullName}</span>
                  <span>{formatDateTime(file.createdAt).split(' ')[0]}</span>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="text-xs font-medium uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {file.fileCategory}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
