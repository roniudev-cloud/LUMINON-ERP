import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@db/schema/crm";
import { webFormSubmissions } from "@db/schema/omnichannel";
import { z } from "zod";

const WebLeadSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  phone: z.string().min(9, "SĐT không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  company: z.string().optional(),
  need: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate data
    const parsed = WebLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu không hợp lệ", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 2. Lưu vào bảng web_form_submissions (Audit/Backup)
    const [submission] = await db.insert(webFormSubmissions).values({
      name: data.name,
      phone: data.phone,
      email: data.email,
      company: data.company,
      need: data.need,
      sourceUrl: data.sourceUrl,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      status: "converted",
    }).returning();

    // 3. Tạo thẳng Lead vào CRM
    const [newLead] = await db.insert(leads).values({
      name: data.name,
      phone: data.phone,
      email: data.email,
      description: `Công ty: ${data.company || "N/A"}\nNhu cầu: ${data.need || "N/A"}\nNguồn: Website\nURL: ${data.sourceUrl || "N/A"}\nUTM Source: ${data.utmSource || "N/A"}\nUTM Medium: ${data.utmMedium || "N/A"}`,
      status: "new",
    }).returning();

    // 4. Update lại reference
    await db.update(webFormSubmissions)
      .set({ leadId: newLead.id })
      .where(eq(webFormSubmissions.id, submission.id));

    // Trả về response cho frontend website
    return NextResponse.json({ 
      success: true, 
      message: "Gửi thông tin thành công", 
      data: { leadId: newLead.id } 
    }, { status: 200 });

  } catch (error) {
    console.error("Web Lead API error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
