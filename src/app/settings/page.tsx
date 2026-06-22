"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const supabase = createClient();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          username: username.trim() || null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Update local state
      if (user) {
        setUser({
          ...user,
          full_name: fullName.trim(),
          username: username.trim() || undefined,
        });
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
    } catch (err) {
      setPasswordMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#080d1a",
    border: "1px solid #1e2840",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff" }}>
          ⚙️ Settings
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 14,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Profile Information
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

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
            />
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              Email cannot be changed
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              Username (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#1e2840" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 6,
            }}
          >
            {loading ? "⏳ Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Password Change */}
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 14,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Change Password
        </h3>

        {passwordMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              background: passwordMessage.type === "success" ? "#052e16" : "#2d0a0a",
              border: `1px solid ${passwordMessage.type === "success" ? "#166534" : "#7f1d1d"}`,
              color: passwordMessage.type === "success" ? "#4ade80" : "#f87171",
              fontSize: 13,
            }}
          >
            {passwordMessage.text}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: passwordLoading ? "#1e2840" : "#1e2840",
              color: "#fff",
              border: "1px solid #374151",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: passwordLoading ? "not-allowed" : "pointer",
              marginTop: 6,
            }}
          >
            {passwordLoading ? "⏳ Updating..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e2840",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Account Information
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Account Type</span>
            <span style={{ color: "#fff", fontWeight: 600, textTransform: "capitalize" }}>
              {user?.role || "user"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Member Since</span>
            <span style={{ color: "#fff" }}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>User ID</span>
            <span style={{ color: "#6b7280", fontSize: 11 }}>{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
