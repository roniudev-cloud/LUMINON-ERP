import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhookEvents } from "@db/schema/omnichannel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zalo gửi event đến webhook, lưu raw data vào webhook_events
    await db.insert(webhookEvents).values({
      channelType: "zalo",
      eventType: body.event_name || "unknown",
      payload: body,
      status: "received",
    });

    // Trả về 200 để Zalo không retry
    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("Zalo webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
