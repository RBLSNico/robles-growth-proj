import { useLoaderData } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import ChatWidget from "../components/ChatWidget";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {
    appUrl: (process.env.SHOPIFY_APP_URL || "").replace(/\/$/, ""),
  };
};

export default function SettingsPage() {
  const { appUrl } = useLoaderData();

  // Widget settings state
  const [enabled, setEnabled] = useState(true);
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [position, setPosition] = useState("br");
  const [primaryColor, setPrimaryColor] = useState("#5b8def");
  const [accentColor, setAccentColor] = useState("#7b61ff");
  const [greeting, setGreeting] = useState("Welcome! I can help you with Instant Checkout info.");
  const [showPreview, setShowPreview] = useState(true);

  // Build a snippet that encodes settings as data attributes (the public script can later read these)
  const snippet = `<script src="${appUrl}/chat-widget.js" data-app-url="${appUrl}" data-enabled="${enabled}" data-default-open="${defaultOpen}" data-position="${position}" data-primary-color="${primaryColor}" data-accent-color="${accentColor}" data-greeting="${encodeURIComponent(greeting)}" defer></script>`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Inter, system-ui, -apple-system, Roboto, Arial" }}>
      <h1 style={{ marginTop: 0 }}>Chat widget — Settings & preview</h1>

      <section style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Enabled
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={defaultOpen} onChange={(e) => setDefaultOpen(e.target.checked)} />
            Open by default
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Position
            <select value={position} onChange={(e) => setPosition(e.target.value)} style={{ marginLeft: 6 }}>
              <option value="br">Bottom right</option>
              <option value="bl">Bottom left</option>
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Primary color
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ marginLeft: 6 }} />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Accent color
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ marginLeft: 6 }} />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", flex: "1 1 320px" }}>
            Greeting
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              style={{ marginLeft: 6, flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(16,24,40,0.08)" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => copyToClipboard(snippet)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(16,24,40,0.06)", background: "#fff" }}
          >
            Copy snippet
          </button>

          <button
            onClick={() => setShowPreview((v) => !v)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#5b8def,#7b61ff)", color: "white" }}
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>

        <div>
          <p style={{ margin: 0, color: "#374151", fontSize: 13 }}>
            Paste the snippet into your theme (for example before the closing &lt;/body&gt;). The data attributes reflect the current settings and can be read by the widget loader.
          </p>

          <pre style={{ background: "#0f1724", color: "#e6eef8", padding: 12, borderRadius: 8, overflow: "auto", marginTop: 8 }}>
            {snippet}
          </pre>
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ margin: "8px 0" }}>Preview</h2>
        <p style={{ margin: 0, color: "#374151", fontSize: 13 }}>
          Live preview uses the settings above. This preview runs in the admin and does not represent the storefront environment exactly, but it shows appearance & behaviour.
        </p>

        {showPreview && (
          <div style={{ marginTop: 12, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(16,24,40,0.06)", padding: 16, background: "#fff" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Backend preview</div>
            <div style={{ position: "relative", minHeight: 420 }}>
              <ChatWidget
                enabled={enabled}
                embedded={defaultOpen}
                defaultOpen={defaultOpen}
                position={position}
                primaryColor={primaryColor}
                accentColor={accentColor}
                greeting={greeting}
              />
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3 style={{ margin: "8px 0" }}>Notes</h3>
        <ul style={{ marginTop: 0, color: "#374151" }}>
          <li>The generated snippet includes data attributes; update your public loader script to read them and initialize the widget accordingly.</li>
          <li>Preview runs in the admin; iframe-based storefront embedding may have slightly different sizing/behavior.</li>
        </ul>
      </section>
    </div>
  );
}
