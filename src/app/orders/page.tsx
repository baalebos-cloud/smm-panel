"use client";
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { fmt, fmtNum } from "@/lib/utils";
import { STATUS_STYLES } from "@/lib/constants";
import type { Order } from "@/types/order";

type FilterStatus = "all" | Order["status"];

export default function OrdersPage() {
  const { orders, fetchOrders } = useOrders();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter((o) => o.status === filter);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const statuses: FilterStatus[] = ["all", "Pending", "Processing", "In Progress", "Completed", "Cancelled", "Partial"];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>
            📋 My Orders
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
            Track and manage all your orders.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: "10px 20px",
            background: "#1e2840",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: refreshing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {refreshing ? "⏳" : "🔄"} Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {statuses.map((status) => {
          const isActive = filter === status;
          const style = status !== "all" ? STATUS_STYLES[status] : null;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: isActive ? (style?.bg || "#7c3aed") : "#1e2840",
                color: isActive ? (style?.text || "#fff") : "#9ca3af",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {status === "all" ? "All Orders" : status}
              {status !== "all" && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>
                  ({orders.filter((o) => o.status === status).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#080d1a" }}>
                {["Order ID", "Service", "Link", "Qty", "Amount", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#6b7280",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #1e2840",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const s = STATUS_STYLES[order.status] ?? STATUS_STYLES["Pending"];
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid #1e2840" }}>
                    <td style={{ padding: "14px 16px", color: "#a78bfa", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {order.id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: "14px 16px", color: "#e5e7eb", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.service_name}
                    </td>
                    <td style={{ padding: "14px 16px", maxWidth: 150 }}>
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#60a5fa", textDecoration: "none", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                      >
                        {order.link}
                      </a>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#9ca3af" }}>{fmtNum(order.quantity)}</td>
                    <td style={{ padding: "14px 16px", color: "#fff", fontWeight: 700 }}>{fmt(order.amount)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: s.bg,
                          color: s.text,
                          borderRadius: 20,
                          padding: "4px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "50px 0", textAlign: "center", color: "#4b5563" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                    <div>No orders found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {orders.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", gap: 20, color: "#6b7280", fontSize: 13 }}>
          <span>Total Orders: <strong style={{ color: "#fff" }}>{orders.length}</strong></span>
          <span>Total Spent: <strong style={{ color: "#4ade80" }}>{fmt(orders.reduce((a, o) => a + o.amount, 0))}</strong></span>
        </div>
      )}
    </div>
  );
}
