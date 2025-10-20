import { useEffect, useRef, useState } from "react";
import styles from "./chatWidget.module.css";

export default function ChatWidget({
  // New configurable props
  embedded = false, // legacy name, still supported
  defaultOpen = false,
  enabled = true,
  position = "br", // "br" or "bl"
  primaryColor = "#5b8def",
  accentColor = "#7b61ff",
  greeting = "Welcome! I can help you with Instant Checkout info.",
}) {
  // initial open prefers embedded (existing usage) then defaultOpen
  const [open, setOpen] = useState(Boolean(embedded ?? defaultOpen));
  const [messages, setMessages] = useState([
    { id: 1, who: "assistant", text: greeting },
  ]);
  const [input, setInput] = useState("");
  const idRef = useRef(2);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = (text) => {
    if (!text || !text.trim()) return;
    const id = idRef.current++;
    setMessages((m) => [...m, { id, who: "user", text }]);
    setInput("");
    // Simulate assistant reply
    setTimeout(() => {
      const aid = idRef.current++;
      setMessages((m) => [
        ...m,
        {
          id: aid,
          who: "assistant",
          text:
            "Thanks! Instant Checkout lets customers complete purchases directly in chat. (Demo response.)",
        },
      ]);
    }, 600 + Math.random() * 700);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // position styles override default absolute right/bottom from css
  const posStyle =
    position === "bl"
      ? { left: 20, right: "auto", bottom: 20 }
      : { right: 20, left: "auto", bottom: 20 };

  // header gradient
  const headerStyle = {
    background: `linear-gradient(90deg, ${primaryColor} 0%, ${accentColor} 100%)`,
  };

  // user bubble gradient
  const userBubbleStyle = {
    background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
    color: "#fff",
  };

  if (!enabled) {
    // Render a small disabled indicator / toggle in place of full widget
    return (
      <div
        className={styles.widgetRoot}
        style={{ position: "absolute", ...posStyle }}
        data-disabled="true"
      >
        <div
          className={styles.header}
          style={{ padding: 10, background: "linear-gradient(90deg,#9aaedc,#bfaeff)", cursor: "default" }}
        >
          <div style={{ fontWeight: 700, fontSize: 13 }}>Chat widget (disabled)</div>
        </div>
        <div style={{ padding: 12, fontSize: 13, color: "#6b7280" }}>
          The chat widget is disabled. Enable it in settings to preview.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.widgetRoot} ${open ? styles.open : ""}`}
      data-embedded={embedded}
      style={{ position: "absolute", ...posStyle }}
    >
      <div className={styles.header} style={headerStyle}>
        <div>
          <div className={styles.title}>Instant Checkout Help</div>
          <div className={styles.subtitle}>Get help using Instant Checkout</div>
        </div>
        <button
          className={styles.toggleButton}
          aria-label={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "−" : "✚"}
        </button>
      </div>

      <div className={styles.body} ref={messagesRef} role="log" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.who === "user" ? styles.msgUser : styles.msgAssistant}
            style={m.who === "user" ? userBubbleStyle : undefined}
          >
            <div className={styles.msgText}>{m.text}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about Instant Checkout..."
          rows={1}
          aria-label="Message"
        />
        <button
          className={styles.sendButton}
          onClick={() => sendMessage(input)}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
