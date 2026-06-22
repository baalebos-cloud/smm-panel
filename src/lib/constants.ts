import type { PlatformMeta, Service } from "@/types/service";

export const PLATFORMS: PlatformMeta[] = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "#E1306C" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "#69C9D0" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "#FF0000" },
  { id: "twitter", label: "X (Twitter)", icon: "🐦", color: "#1DA1F2" },
  { id: "facebook", label: "Facebook", icon: "📘", color: "#1877F2" },
  { id: "spotify", label: "Spotify", icon: "🎧", color: "#1DB954" },
];

export const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Completed: { bg: "#052e16", text: "#4ade80", dot: "#22c55e" },
  "In Progress": { bg: "#1e3a5f", text: "#60a5fa", dot: "#3b82f6" },
  Processing: { bg: "#2d1b00", text: "#fbbf24", dot: "#f59e0b" },
  Cancelled: { bg: "#2d0a0a", text: "#f87171", dot: "#ef4444" },
  Pending: { bg: "#1a1a2e", text: "#a78bfa", dot: "#7c3aed" },
  Partial: { bg: "#1a1200", text: "#fb923c", dot: "#f97316" },
};

export const ALL_SERVICES: Service[] = [
  // ── Instagram ──────────────────────────────────────────────────────────────
  { id: 1, platform: "instagram", category: "Followers", name: "Nigerian Instagram Followers – Real & Active", rate: 180, min: 100, max: 10000, delivery: "0–1 Hour", refill: true, popular: true },
  { id: 2, platform: "instagram", category: "Followers", name: "Instagram Followers – Global Mix", rate: 90, min: 500, max: 50000, delivery: "0–2 Hours", refill: false, popular: false },
  { id: 3, platform: "instagram", category: "Likes", name: "Instagram Likes – Nigerian Accounts", rate: 60, min: 50, max: 5000, delivery: "Instant", refill: true, popular: true },
  { id: 4, platform: "instagram", category: "Likes", name: "Instagram Likes – Auto (New Posts)", rate: 120, min: 50, max: 2000, delivery: "Instant", refill: false, popular: false },
  { id: 5, platform: "instagram", category: "Views", name: "Instagram Reel Views", rate: 20, min: 1000, max: 500000, delivery: "Instant", refill: false, popular: true },
  { id: 6, platform: "instagram", category: "Comments", name: "Instagram Comments – Custom", rate: 500, min: 10, max: 500, delivery: "1–6 Hours", refill: false, popular: false },
  // ── TikTok ─────────────────────────────────────────────────────────────────
  { id: 7, platform: "tiktok", category: "Followers", name: "TikTok Followers – Nigerian Real", rate: 200, min: 100, max: 10000, delivery: "0–2 Hours", refill: true, popular: true },
  { id: 8, platform: "tiktok", category: "Views", name: "TikTok Video Views", rate: 15, min: 1000, max: 1000000, delivery: "Instant", refill: false, popular: true },
  { id: 9, platform: "tiktok", category: "Likes", name: "TikTok Likes – Real", rate: 80, min: 100, max: 10000, delivery: "Instant", refill: false, popular: false },
  // ── YouTube ────────────────────────────────────────────────────────────────
  { id: 10, platform: "youtube", category: "Subscribers", name: "YouTube Subscribers – Nigerian", rate: 350, min: 50, max: 5000, delivery: "0–24 Hours", refill: true, popular: true },
  { id: 11, platform: "youtube", category: "Views", name: "YouTube Views – High Retention", rate: 40, min: 500, max: 100000, delivery: "0–6 Hours", refill: false, popular: true },
  { id: 12, platform: "youtube", category: "Watch Time", name: "YouTube Watch Hours (4000h Package)", rate: 15000, min: 1, max: 10, delivery: "7–14 Days", refill: false, popular: false },
  // ── X (Twitter) ────────────────────────────────────────────────────────────
  { id: 13, platform: "twitter", category: "Followers", name: "X Followers – Nigerian Accounts", rate: 150, min: 100, max: 10000, delivery: "0–2 Hours", refill: true, popular: true },
  { id: 14, platform: "twitter", category: "Likes", name: "X Tweet Likes", rate: 50, min: 50, max: 10000, delivery: "Instant", refill: false, popular: false },
  { id: 15, platform: "twitter", category: "Retweets", name: "X Retweets – Real Accounts", rate: 100, min: 50, max: 5000, delivery: "0–1 Hour", refill: false, popular: false },
  // ── Facebook ───────────────────────────────────────────────────────────────
  { id: 16, platform: "facebook", category: "Page Likes", name: "Facebook Page Likes – Nigerian", rate: 160, min: 100, max: 10000, delivery: "0–6 Hours", refill: true, popular: false },
  { id: 17, platform: "facebook", category: "Post Reactions", name: "Facebook Post Reactions", rate: 70, min: 100, max: 10000, delivery: "Instant", refill: false, popular: false },
  // ── Spotify ────────────────────────────────────────────────────────────────
  { id: 18, platform: "spotify", category: "Streams", name: "Spotify Streams – Nigerian Region", rate: 25, min: 1000, max: 500000, delivery: "0–12 Hours", refill: false, popular: true },
  { id: 19, platform: "spotify", category: "Monthly Listeners", name: "Spotify Monthly Listeners Boost", rate: 300, min: 100, max: 10000, delivery: "0–24 Hours", refill: false, popular: false },
];

export const LIVE_TICKER = [
  "⚡ @kemzy just ordered 500 Instagram Followers",
  "🔥 @davido_fan ordered 10K TikTok Views",
  "✅ ORD-4821 — Instagram Followers delivered!",
  "💸 @brandng funded wallet with ₦50,000",
  "⚡ @saro_creator ordered YouTube Subscribers",
  "🔥 @nigeriabrand ordered 5K Spotify Streams",
  "✅ ORD-4819 — YouTube Subs in progress",
];
