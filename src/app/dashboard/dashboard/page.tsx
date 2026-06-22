"use client";
import { useAppStore } from "@/store/useAppStore";
import { useOrders } from "@/hooks/useOrders";
import { fmt, fmtNum } from "@/lib/utils";
import { STATUS_STYLES } from "@/lib/constants";
import type { Order } from "@/types/order";

function StatCard({
  icon, label, value, sub, subColor,
}: {
  icon: string; label: string; value: string; sub?: string; subColor?: string;
}) {
  return (
    <div
      style={{
        background: "#0d1424",
        border: "1px solid #1e2840",
        borderRadius: 14,
        padding: "20px 22px",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const s = STATUS_STYLES[order.status] ?? STATUS_STYLES["Pending"];
  return (
    <tr style={{ borderTop: "1px solid #1e2840" }}>
      <td style={{ padding: "12px 16px", color: "#a78bfa", fontWeight: 700, whiteSpace: "nowrap" }}>{order.id}</td>
      <td style={{ padding: "12px 16px", color: "#e5e7eb", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.service_name}</td>
      <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{fmtNum(order.quantity)}</td>
      <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 700 }}>{fmt(order.amount)}</td>
      <td style={{ padding: "12px 16px" }}>
        <span style={{ background: s.bg, color: s.text, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
          {order.status}
        </span>
      </td>
      <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>
        {new Date(order.created_at).toLocaleDateString("en-NG")}
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const { orders } = useOrders();

  const completed = orders.filter((o) => o.status === "Completed").length;
  const active = orders.filter((o) => ["In Progress", "Processing", "Pending"].includes(o.status)).length;
  const spent = orders.filter((o) => o.status !== "Cancelled").reduce((a, o) => a + o.amount, 0);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>
          Welcome back, {user?.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Here&apos;s your growth dashboard at a glance.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon="💰" label="Wallet Balance" value={fmt(user?.wallet_balance ?? 0)} sub="+ Add Funds →" subColor="#4ade80" />
        <StatCard icon="✅" label="Completed Orders" value={String(completed)} sub="All time" subColor="#60a5fa" />
        <StatCard icon="⏳" label="Active Orders" value={String(active)} sub="In delivery" subColor="#fbbf24" />
        <StatCard icon="📊" label="Total Spent" value={fmt(spent)} sub="Lifetime" subColor="#a78bfa" />
      </div>

      {/* Recent Orders */}
      <div style={{ background: "#0d1424", border: "1px solid #1e2840", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2840" }}>
          <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>Recent Orders</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#080d1a" }}>
                {["Order ID", "Service", "Qty", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => <OrderRow key={o.id} order={o} />)}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 0", textAlign: "center", color: "#4b5563" }}>
                    No orders yet. Place your first order →
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
