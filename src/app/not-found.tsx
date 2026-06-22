import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 16,
          padding: "40px",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          Page Not Found
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
