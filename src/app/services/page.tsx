"use client";
import { useState, useMemo } from "react";
import { ALL_SERVICES, PLATFORMS } from "@/lib/constants";
import { fmt, calcCost } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import type { Platform, Service } from "@/types/service";

export default function ServicesPage() {
  const { balance, canAfford } = useWallet();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "all">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredServices = useMemo(() => {
    if (selectedPlatform === "all") return ALL_SERVICES;
    return ALL_SERVICES.filter((s) => s.platform === selectedPlatform);
  }, [selectedPlatform]);

  const cost = useMemo(() => {
    if (!selectedService || !quantity) return 0;
    return calcCost(Number(quantity), selectedService.rate);
  }, [selectedService, quantity]);

  const handleOrder = async () => {
    if (!selectedService || !link || !quantity) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    const qty = Number(quantity);
    if (qty < selectedService.min || qty > selectedService.max) {
      setMessage({ type: "error", text: `Quantity must be between ${selectedService.min} and ${selectedService.max}` });
      return;
    }

    if (!canAfford(cost)) {
      setMessage({ type: "error", text: "Insufficient wallet balance. Please add funds." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link,
          quantity: qty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      setMessage({ type: "success", text: "Order placed successfully! 🎉" });
      setLink("");
      setQuantity("");
      setSelectedService(null);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to place order" });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0d1424",
    border: "1px solid #1e2840",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>
          ⚡ New Order
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Select a service and place your order instantly.
        </p>
      </div>

      {/* Platform Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          onClick={() => setSelectedPlatform("all")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: selectedPlatform === "all" ? "#7c3aed" : "#1e2840",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All Platforms
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: selectedPlatform === p.id ? p.color : "#1e2840",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Services List */}
        <div style={{ flex: 2, minWidth: 300 }}>
          <div
            style={{
              background: "#0d1424",
              border: "1px solid #1e2840",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #1e2840" }}>
              <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>
                Available Services ({filteredServices.length})
              </span>
            </div>
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              {filteredServices.map((service) => {
                const platform = PLATFORMS.find((p) => p.id === service.platform);
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #1e2840",
                      cursor: "pointer",
                      background: isSelected ? "#7c3aed22" : "transparent",
                      borderLeft: isSelected ? "3px solid #7c3aed" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>{platform?.icon}</span>
                          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{service.name}</span>
                          {service.popular && (
                            <span style={{ background: "#f59e0b", color: "#000", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              HOT
                            </span>
                          )}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>
                          {service.min.toLocaleString()} - {service.max.toLocaleString()} • {service.delivery}
                          {service.refill && " • 🔄 Refill"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 14 }}>
                          {fmt(service.rate)}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 11 }}>per 1K</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              background: "#0d1424",
              border: "1px solid #1e2840",
              borderRadius: 14,
              padding: 20,
              position: "sticky",
              top: 20,
            }}
          >
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Order Details
            </h3>

            {message && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 16,
                  background: message.type === "success" ? "#052e16" : "#2d0a0a",
                  border: `1px solid ${message.type === "success" ? "#166534" : "#7f1d1d"}`,
                  color: message.type === "success" ? "#4ade80" : "#f87171",
                  fontSize: 13,
                }}
              >
                {message.text}
              </div>
            )}

            {selectedService ? (
              <>
                <div style={{ marginBottom: 14, padding: 12, background: "#080d1a", borderRadius: 8 }}>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4 }}>Selected Service</div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{selectedService.name}</div>
                  <div style={{ color: "#4ade80", fontSize: 12, marginTop: 4 }}>{fmt(selectedService.rate)} per 1K</div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                    Link (URL)
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://instagram.com/username"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                    Quantity ({selectedService.min.toLocaleString()} - {selectedService.max.toLocaleString()})
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={`Min: ${selectedService.min}`}
                    min={selectedService.min}
                    max={selectedService.max}
                    style={inputStyle}
                  />
                </div>

                <div style={{ padding: 12, background: "#080d1a", borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>Cost</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{fmt(cost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>Your Balance</span>
                    <span style={{ color: canAfford(cost) ? "#4ade80" : "#f87171", fontWeight: 600, fontSize: 13 }}>
                      {fmt(balance)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={loading || !canAfford(cost)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: loading || !canAfford(cost) ? "#1e2840" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: loading || !canAfford(cost) ? "not-allowed" : "pointer",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {loading ? "⏳ Processing..." : !canAfford(cost) ? "Insufficient Balance" : "Place Order →"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#6b7280" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>👈</div>
                <div style={{ fontSize: 13 }}>Select a service to continue</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
