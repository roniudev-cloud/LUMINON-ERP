"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCustomerActivity } from "@/actions/customers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ActivityForm({ customerId }: { customerId: string }) {
  const [type, setType] = useState("call");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }

    startTransition(async () => {
      try {
        await addCustomerActivity(customerId, { type, description });
        setDescription("");
        toast.success("Đã thêm hoạt động");
      } catch (error: any) {
        toast.error("Lỗi cập nhật", { description: error.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 border rounded-xl p-4 bg-muted/20">
      <div className="flex gap-4">
        <div className="w-1/3 max-w-[200px]">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Loại hoạt động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">📞 Gọi điện</SelectItem>
              <SelectItem value="message">💬 Nhắn tin</SelectItem>
              <SelectItem value="meeting">🤝 Gặp trực tiếp</SelectItem>
              <SelectItem value="quote">📄 Gửi báo giá</SelectItem>
              <SelectItem value="note">📝 Ghi chú</SelectItem>
              <SelectItem value="other">📌 Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Textarea
        placeholder="Nhập nội dung tương tác hoặc ghi chú..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[80px]"
      />
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !description.trim()}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Thêm hoạt động
        </Button>
      </div>
    </form>
  );
}
