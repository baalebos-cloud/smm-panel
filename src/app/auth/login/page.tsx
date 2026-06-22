"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0d1424",
    border: "1px solid #1e2840",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 900,
            fontSize: 32,
            color: "#fff",
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#7c3aed" }}>⚡</span> SMMPanel
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
          Nigeria&apos;s #1 Social Media Growth Platform
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 16,
          padding: "32px 28px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          Log In to Your Account
        </h1>

        {error && (
          <div
            style={{
              background: "#2d0a0a",
              border: "1px solid #7f1d1d",
              color: "#f87171",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link
              href="/auth/forgot-password"
              style={{ fontSize: 12, color: "#7c3aed", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#1e2840" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif",
              marginTop: 4,
            }}
          >
            {loading ? "⏳ Logging in…" : "Log In →"}
          </button>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 20 }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}>
          Create one free
        </Link>
      </p>
    </div>
  );
}
