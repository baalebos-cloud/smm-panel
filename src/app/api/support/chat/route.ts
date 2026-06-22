import { NextRequest, NextResponse } from "next/server";
import { getChatReply } from "@/lib/claude";
import type { ChatMessage } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const reply = await getChatReply(messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[POST /api/support/chat]", err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
