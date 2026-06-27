import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

/**
 * Tạo file DOCX dựa trên URL của file mẫu và dữ liệu data.
 * @param templateBuffer - ArrayBuffer của file docx tải từ Supabase Storage.
 * @param data - Object chứa các biến sẽ được thay thế (ví dụ: { TEN_KHACH: "A", TONG_TIEN: "1M" }).
 * @param outputName - Tên file tải về.
 */
export function generateDocx(templateBuffer: ArrayBuffer, data: Record<string, any>, outputName: string) {
  try {
    const zip = new PizZip(templateBuffer);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Binding dữ liệu
    doc.render(data);

    // Xuất file
    const blob = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, outputName);
  } catch (error) {
    console.error("Lỗi khi xuất DOCX:", error);
    throw new Error("Không thể xuất file Word. Kiểm tra lại các thẻ biến trong template.");
  }
}
