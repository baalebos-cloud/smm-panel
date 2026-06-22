import { NextRequest, NextResponse } from "next/server";
import { getChatReply } from "@/lib/claude";
import type { ChatMessage } from "@/lib/claude";
import { rateLimit } from "@/lib/rate-limit";

const MAX_MESSAGES = 50;
const MAX_TOTAL_LENGTH = 50000;
const MAX_MESSAGE_LENGTH = 5000;

export async function POST(req: NextRequest) {
  // Rate limiting - 20 requests per minute
  const rateLimitResponse = rateLimit(req, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    // Validate messages format
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Validate message count
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Too many messages. Maximum is ${MAX_MESSAGES}` },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Validate each message structure and content length
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
          { error: `Individual message too long. Maximum is ${MAX_MESSAGE_LENGTH} characters` },
          { status: 400 }
        );
      }
      totalLength += msg.content.length;
    }

    if (totalLength > MAX_TOTAL_LENGTH) {
      return NextResponse.json(
        { error: `Total message content too long. Maximum is ${MAX_TOTAL_LENGTH} characters` },
        { status: 400 }
      );
    }

    const reply = await getChatReply(messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[POST /api/support/chat]", err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
