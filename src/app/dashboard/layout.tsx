"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { LIVE_TICKER } from "@/lib/constants";

const NAV = [
  { href: "/dashboard", icon: "◈", label: "Dashboard" },
  { href: "/services", icon: "⚡", label: "New Order" },
  { href: "/orders", icon: "📋", label: "My Orders" },
  { href: "/wallet", icon: "💳", label: "Add Funds" },
  { href: "/support", icon: "🤖", label: "AI Support" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LIVE_TICKER.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      style={{
        background: "linear-gradient(90deg,#7c3aed22,#f59e0b22)",
        borderBottom: "1px solid #7c3aed44",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          background: "#7c3aed",
          color: "#fff",
          borderRadius: 4,
          padding: "2px 8px",
          fontWeight: 700,
          fontSize: 11,
          whiteSpace: "nowrap",
        }}
      >
        LIVE
      </span>
      <span style={{ color: "#c4b5fd" }}>{LIVE_TICKER[idx]}</span>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { formattedBalance } = useWallet();
  const router = useRouter();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080d1a" }}>
      <LiveTicker />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 230,
            background: "#080d1a",
            borderRight: "1px solid #1e2840",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid #1e2840" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: -0.5 }}>
              <span style={{ color: "#7c3aed" }}>⚡</span> SMMPanel
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Nigeria&apos;s #1 Growth Platform</div>
          </div>

          {/* Balance */}
          <div
            style={{
              margin: "14px 12px",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              borderRadius: 12,
              padding: "14px 16px",
              cursor: "pointer",
            }}
            onClick={() => router.push("/wallet")}
          >
            <div style={{ fontSize: 11, color: "#c4b5fd", marginBottom: 4 }}>Wallet Balance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif" }}>
              {formattedBalance}
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "6px 8px" }}>
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 12px",
                    borderRadius: 10,
                    marginBottom: 2,
                    background: active ? "#7c3aed22" : "transparent",
                    color: active ? "#a78bfa" : "#9ca3af",
                    fontWeight: active ? 700 : 400,
                    fontSize: 14,
                    textDecoration: "none",
                    borderLeft: active ? "3px solid #7c3aed" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 17 }}>{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid #1e2840",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.full_name ?? "Loading…"}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{user?.role ?? "user"}</div>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 16, padding: 4 }}
            >
              ⏏
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
