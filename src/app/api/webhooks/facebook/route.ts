import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhookEvents } from "@db/schema/omnichannel";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Normally, check token against process.env.FACEBOOK_VERIFY_TOKEN
  if (mode === "subscribe" && token) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === "page") {
      // Lưu raw event vào database để xử lý bất đồng bộ sau
      await db.insert(webhookEvents).values({
        channelType: "facebook",
        eventType: "page",
        payload: body,
        status: "received",
      });

      // Ở hệ thống thực tế: Push event ID vào Queue/BullMQ để worker xử lý
      // Ở đây ta placeholder trả về 200 ngay lập tức cho Facebook
      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    return NextResponse.json({ error: "Not a page event" }, { status: 404 });
  } catch (error) {
    console.error("Facebook webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
