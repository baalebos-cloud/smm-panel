import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert support agent for SMMPanel Nigeria — Nigeria's #1 social media growth platform.

Services: Instagram, TikTok, YouTube, X (Twitter), Facebook, Spotify.
Offerings: followers, likes, views, streams, subscribers, comments, retweets.
Pricing: all in Nigerian Naira (₦). Rates shown as ₦X per 1,000 units.
Payments: Debit/Credit Card, Bank Transfer, OPay/Moniepoint, USSD.
Wallet: users pre-fund a wallet, then spend from it on orders.

Key policies:
- Refill guarantee on services marked "Refill" — if followers drop within 30 days, we replace them free.
- Delivery times vary per service (Instant to 7–14 days).
- No refunds once an order is In Progress or Completed.
- Cancelled orders are refunded to wallet balance.
- Minimum order amounts vary per service.

Delivery Times:
- Instagram Followers: 0-2 hours
- Instagram Likes: Instant
- Instagram Views: Instant
- TikTok Followers: 0-2 hours
- TikTok Views: Instant
- YouTube Subscribers: 0-24 hours
- YouTube Views: 0-6 hours
- Twitter/X Followers: 0-2 hours
- Spotify Streams: 0-12 hours

Wallet Funding:
- Minimum deposit: ₦500
- Maximum deposit: ₦1,000,000
- Payment methods: Card, Bank Transfer, USSD
- Funds reflect instantly after payment confirmation

Be concise, professional, and friendly. Use simple Nigerian-friendly language. 
Answer questions about orders, wallet, delivery, refills, service quality, and social media growth tips.
If you don't know something specific, direct the user to email support@smmpanel.ng.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getChatReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not configured");
    throw new Error("API key not configured");
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const block = response.content.find((b) => b.type === "text");
    return block ? block.text : "I'm unable to respond right now. Please try again.";
  } catch (error) {
    console.error("Anthropic API error:", error);
    throw error;
  }
}
