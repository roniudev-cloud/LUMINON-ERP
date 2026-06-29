"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PenTool, Upload, Eraser, Loader2 } from "lucide-react";
import { saveContractSignature } from "@/actions/contracts";

interface DigitalSignatureDialogProps {
  contractId: string;
}

export function DigitalSignatureDialog({ contractId }: DigitalSignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [signatureType, setSignatureType] = useState("customer");
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
    setImagePreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    let base64Data = "";
    
    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Check if canvas is empty (simplified check)
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        toast.error("Vui lòng ký trước khi lưu");
        return;
      }
      
      base64Data = canvas.toDataURL("image/png");
    } else {
      if (!imagePreview) {
        toast.error("Vui lòng tải lên ảnh chữ ký");
        return;
      }
      base64Data = imagePreview;
    }

    startTransition(async () => {
      try {
        await saveContractSignature(contractId, signatureType, base64Data);
        toast.success("Đã lưu chữ ký điện tử");
        setOpen(false);
        clearCanvas();
      } catch (error: any) {
        toast.error("Lỗi khi lưu chữ ký", { description: error.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PenTool className="mr-2 h-4 w-4" /> Ký điện tử
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ký điện tử hợp đồng</DialogTitle>
          <DialogDescription>
            Vẽ chữ ký trực tiếp hoặc tải lên ảnh PNG/JPG.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vai trò ký</label>
            <Select value={signatureType} onValueChange={setSignatureType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Đại diện khách hàng</SelectItem>
                <SelectItem value="representative">Đại diện công ty (Sales)</SelectItem>
                <SelectItem value="company_stamp">Con dấu công ty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={mode === "draw" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMode("draw")}
              className="flex-1"
            >
              <PenTool className="mr-2 h-4 w-4" /> Vẽ tay
            </Button>
            <Button 
              variant={mode === "upload" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMode("upload")}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" /> Tải ảnh lên
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg bg-muted/30 overflow-hidden relative" style={{ height: "200px" }}>
            {mode === "draw" ? (
              <>
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={196}
                  className="bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  onClick={clearCanvas}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Signature Preview" className="max-h-full max-w-full object-contain p-2" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Chọn ảnh chữ ký (nền trong suốt khuyên dùng)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      className="mt-4 text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu chữ ký
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
