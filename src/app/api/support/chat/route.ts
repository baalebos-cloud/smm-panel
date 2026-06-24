import { NextRequest, NextResponse } from "next/server";
import { getChatReply } from "@/lib/groq";
import type { ChatMessage } from "@/lib/groq";

export const dynamic = "force-dynamic";

const MAX_MESSAGES = 50;
const MAX_TOTAL_LENGTH = 50000;
const MAX_MESSAGE_LENGTH = 5000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Too many messages. Maximum is ${MAX_MESSAGES}` },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    let totalLength = 0;
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json({ error: "Invalid message structure" }, { status: 400 });
      }
      if (msg.role !== "user" && msg.role !== "assistant") {
        return NextResponse.json({ error: "Invalid message role" }, { status: 400 });
      }
      if (typeof msg.content !== "string") {
        return NextResponse.json({ error: "Message content must be a string" }, { status: 400 });
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          { error: `Message too long. Maximum is ${MAX_MESSAGE_LENGTH} characters` },
          { status: 400 }
        );
      }
      totalLength += msg.content.length;
    }

    if (totalLength > MAX_TOTAL_LENGTH) {
      return NextResponse.json(
        { error: `Total content too long. Maximum is ${MAX_TOTAL_LENGTH} characters` },
        { status: 400 }
      );
    }

    const reply = await getChatReply(messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[POST /api/support/chat] Error:", err);

    if (err instanceof Error) {
      if (err.message.includes("API key")) {
        return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
      }
      if (err.message.includes("rate limit") || err.message.includes("429")) {
        return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
      }
    }

    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
