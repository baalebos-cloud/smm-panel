"use client";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." },
      ]);
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: "#0d1424",
    border: "1px solid #1e2840",
    borderRadius: 10,
    padding: "14px 16px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid #1e2840" }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>
          🤖 AI Support
        </h1>
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
          Get instant help with orders, wallet, delivery, and more.
        </p>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <div style={{ fontSize: 15, marginBottom: 8 }}>How can I help you today?</div>
            <div style={{ fontSize: 12 }}>Ask me about orders, payments, delivery times, or anything else!</div>
            
            {/* Quick Questions */}
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {[
                "How do I fund my wallet?",
                "What's the delivery time?",
                "Do you offer refills?",
                "Is my order safe?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  style={{
                    padding: "8px 14px",
                    background: "#1e2840",
                    border: "none",
                    borderRadius: 20,
                    color: "#9ca3af",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: 16,
                background: msg.role === "user" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "#0d1424",
                border: msg.role === "user" ? "none" : "1px solid #1e2840",
                color: "#fff",
                fontSize: 14,
                lineHeight: 1.5,
                borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.role === "user" ? 16 : 4,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 16,
                background: "#0d1424",
                border: "1px solid #1e2840",
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: "16px 28px", borderTop: "1px solid #1e2840" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            style={inputStyle}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: "14px 24px",
              background: loading || !input.trim() ? "#1e2840" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
