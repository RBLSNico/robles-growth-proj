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

  // New professional settings
  avatarUrl = undefined,
  iconUrl = undefined,
  minimizeOnScroll = false,
  persistOpen = false,
  analyticsEndpoint = undefined,
  positionOffset = { right: 20, bottom: 20 },
  size = 56,
  borderRadius = 12,
  locale = "en",
  ariaLabelOpen = "Open chat",
  ariaLabelClose = "Close chat",
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

  // prefer persisted value when requested (persistOpen)
  useEffect(() => {
    if (persistOpen) {
      try {
        const saved = localStorage.getItem("scw_open");
        if (saved !== null) {
          setOpen(saved === "true");
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist changes
  useEffect(() => {
    if (persistOpen) {
      try {
        localStorage.setItem("scw_open", String(open));
      } catch {}
    }
  }, [open, persistOpen]);

  // scroll -> minimize behaviour
  useEffect(() => {
    if (!minimizeOnScroll) return;
    let last = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      // collapse when scrolled down past 200px
      if (y > 200 && open) setOpen(false);
      last = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [minimizeOnScroll, open]);

  // outside click -> close when open
  useEffect(() => {
    function onDocClick(e) {
      const root = rootRef.current;
      if (!root || !open) return;
      if (!root.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  // keyboard shortcut: 'c' to toggle (avoid when typing)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "c" && (document.activeElement?.tagName || "") !== "TEXTAREA" && (document.activeElement?.tagName || "") !== "INPUT") {
        setOpen((v) => !v);
        sendAnalytics("toggle_shortcut");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // analytics helper
  function sendAnalytics(eventType, meta = {}) {
    if (!analyticsEndpoint) return;
    try {
      const payload = JSON.stringify({ event: eventType, timestamp: Date.now(), meta });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(analyticsEndpoint, payload);
      } else {
        fetch(analyticsEndpoint, { method: "POST", body: payload, headers: { "Content-Type": "application/json" } });
      }
    } catch {}
  }

  // wrapper ref and root ref for outside-click
  const rootRef = useRef(null);

  // position style now using offsets and safe-area insets + size for closed state
  const posStyle =
    position === "bl"
      ? { left: `calc(${positionOffset.left ?? positionOffset.right ?? 20}px + env(safe-area-inset-left, 0px))`, right: "auto", bottom: `calc(${positionOffset.bottom ?? 20}px + env(safe-area-inset-bottom, 0px))` }
      : { right: `calc(${positionOffset.right ?? 20}px + env(safe-area-inset-right, 0px))`, left: "auto", bottom: `calc(${positionOffset.bottom ?? 20}px + env(safe-area-inset-bottom, 0px))` };

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
        style={{ position: "fixed", ...posStyle }}
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
      ref={rootRef}
      className={`${styles.widgetRoot} ${open ? styles.open : ""}`}
      data-embedded={embedded}
      style={{ position: "fixed", width: 360, maxWidth: "calc(100% - 40px)", borderRadius: borderRadius, ...posStyle }}
      aria-hidden={!open}
    >
      <div
        className={styles.header}
        style={headerStyle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? ariaLabelClose : ariaLabelOpen}
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            sendAnalytics(next ? "open" : "close");
            return next;
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => {
              const next = !v;
              sendAnalytics(next ? "open" : "close");
              return next;
            });
          }
        }}
      >
        <div className={styles.headerText}>
          <div className={styles.title}>Instant Checkout Help</div>
          <div className={styles.subtitle}>Get help using Instant Checkout</div>
        </div>

        {/* mini icon */}
        <div className={styles.miniIcon} aria-hidden>
          {iconUrl ? (
            <img src={iconUrl} alt="Chat icon" style={{ width: 40, height: 40, borderRadius: 8 }} />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 3C7.03 3 3 6.69 3 11c0 1.9.73 3.66 1.99 5.12L4 21l4.18-1.4C9.03 19.83 10.5 20 12 20c4.97 0 9-3.69 9-8s-4.03-9-9-9z" fill="#5B8DEF"/>
            </svg>
          )}
        </div>

        <button
          className={styles.toggleButton}
          aria-label={open ? ariaLabelClose : ariaLabelOpen}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => {
              const next = !v;
              sendAnalytics(next ? "open" : "close");
              return next;
            });
          }}
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
          placeholder={locale === "en" ? "Ask about Instant Checkout..." : "Ask about Instant Checkout..."}
          rows={1}
          aria-label="Message"
        />
        <button
          className={styles.sendButton}
          onClick={() => {
            sendMessage(input);
            sendAnalytics("send_message", { length: input?.length || 0 });
          }}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
