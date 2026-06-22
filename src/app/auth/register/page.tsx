"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!fullName || !email || !password) return setError("Please fill in all fields.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      await signUp(email, password, fullName);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
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
  };

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 32, color: "#fff" }}>
          <span style={{ color: "#7c3aed" }}>⚡</span> SMMPanel
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
          Join 200,000+ users growing on social media
        </p>
      </div>

      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 16,
          padding: "32px 28px",
        }}
      >
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 24 }}>
          Create Your Account
        </h1>

        {error && (
          <div style={{ background: "#2d0a0a", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Full Name", val: fullName, set: setFullName, type: "text", ph: "John Doe" },
            { label: "Email Address", val: email, set: setEmail, type: "email", ph: "you@example.com" },
            { label: "Password (min 8 chars)", val: password, set: setPassword, type: "password", ph: "••••••••" },
          ].map(({ label, val, set, type, ph }) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={inputStyle} />
            </div>
          ))}

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
            {loading ? "⏳ Creating account…" : "Create Account →"}
          </button>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 20 }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
