import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  timestamp: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.timestamp > 300000) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

export function rateLimit(
  req: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return null;
  }

  if (record.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  record.count++;
  return null;
}

export function rateLimitByUser(
  userId: string,
  limit: number = 20,
  windowMs: number = 60000
): boolean {
  const key = `user:${userId}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.timestamp > windowMs) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
