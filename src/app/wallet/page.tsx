"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useAppStore } from "@/store/useAppStore";
import { fmt } from "@/lib/utils";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

function WalletContent() {
  const searchParams = useSearchParams();
  const { balance } = useWallet();
  const user = useAppStore((s) => s.user);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Check for payment status from redirect
  useEffect(() => {
    const status = searchParams.get("status");
    const paidAmount = searchParams.get("amount");
    const alreadyProcessed = searchParams.get("already_processed");

    if (status === "success") {
      if (alreadyProcessed) {
        setMessage({ type: "info", text: "This payment was already processed." });
      } else {
        setMessage({ type: "success", text: `Payment successful! ${paidAmount ? fmt(Number(paidAmount)) : ""} added to your wallet.` });
      }
    } else if (status === "failed") {
      setMessage({ type: "error", text: "Payment failed. Please try again." });
    } else if (status === "error") {
      setMessage({ type: "error", text: "An error occurred. Please contact support." });
    }
  }, [searchParams]);

  const handleFund = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 500) {
      setMessage({ type: "error", text: "Minimum amount is ₦500" });
      return;
    }

    if (numAmount > 1000000) {
      setMessage({ type: "error", text: "Maximum amount is ₦1,000,000" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to payment gateway
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to process payment" });
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0d1424",
    border: "1px solid #1e2840",
    borderRadius: 10,
    padding: "14px 16px",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    textAlign: "center",
    fontWeight: 700,
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>
          💳 Add Funds
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Top up your wallet to place orders instantly.
        </p>
      </div>

      {/* Current Balance Card */}
      <div
        style={{
          background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
        }}
      >
        <div style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 4 }}>Current Balance</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: "#fff" }}>
          {fmt(balance)}
        </div>
        <div style={{ color: "#c4b5fd", fontSize: 12, marginTop: 8 }}>
          👤 {user?.email || user?.full_name || "Guest"}
        </div>
      </div>

      {/* Fund Form */}
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Fund Your Wallet
        </h3>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 16,
              background: message.type === "success" ? "#052e16" : message.type === "info" ? "#1e3a5f" : "#2d0a0a",
              border: `1px solid ${message.type === "success" ? "#166534" : message.type === "info" ? "#1e40af" : "#7f1d1d"}`,
              color: message.type === "success" ? "#4ade80" : message.type === "info" ? "#60a5fa" : "#f87171",
              fontSize: 13,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 10 }}>
            Quick Select
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(String(amt))}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: amount === String(amt) ? "#7c3aed" : "#1e2840",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {fmt(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 8 }}>
            Or Enter Custom Amount (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min={500}
            max={1000000}
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, textAlign: "center" }}>
            Min: ₦500 • Max: ₦1,000,000
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleFund}
          disabled={loading || !amount}
          style={{
            width: "100%",
            padding: "16px",
            background: loading || !amount ? "#1e2840" : "linear-gradient(135deg,#4ade80,#22c55e)",
            color: loading || !amount ? "#6b7280" : "#000",
            border: "none",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 15,
            cursor: loading || !amount ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {loading ? "⏳ Redirecting to payment..." : `Pay ${amount ? fmt(Number(amount)) : "₦0"} →`}
        </button>

        {/* Payment Methods */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>Accepted Payment Methods</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 20 }}>
            <span title="Debit/Credit Card">💳</span>
            <span title="Bank Transfer">🏦</span>
            <span title="USSD">📱</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
          <div>Loading wallet...</div>
        </div>
      </div>
    }>
      <WalletContent />
    </Suspense>
  );
}
