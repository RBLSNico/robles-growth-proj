import { useLoaderData } from "react-router";
import ChatWidget from "../components/ChatWidget";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  return { embedded: url.searchParams.get("embed") === "true" };
};

export default function ChatWidgetPage() {
  const { embedded } = useLoaderData();

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, -apple-system, Roboto, Arial" }}>
      <h1 style={{ margin: 0, marginBottom: 8 }}>Chat widget preview</h1>
      <p style={{ marginTop: 0, color: "#374151" }}>
        Preview of the embeddable chat widget. Use the controls below to preview in different sizes.
      </p>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 880,
            maxWidth: "100%",
            minHeight: 420,
            borderRadius: 12,
            background:
              "linear-gradient(180deg, #ffffff, #fbfbff)",
            boxShadow: "0 8px 24px rgba(16,24,40,0.06)",
            padding: 20,
            position: "relative",
            overflow: "hidden",
            flex: "1 1 560px",
          }}
        >
          <div style={{ color: "#0b1228", fontWeight: 600, marginBottom: 8 }}>
            Storefront preview (desktop)
          </div>
          <div style={{ color: "#374151", marginBottom: 12, fontSize: 13 }}>
            This area simulates a storefront page. The chat widget is shown in the lower-right.
          </div>

          {/* Place the widget in the preview. When embedded is true, widget will open by default. */}
          <ChatWidget embedded={embedded || true} />
        </div>

        <div
          style={{
            width: 360,
            borderRadius: 12,
            background: "#0b1228",
            color: "white",
            padding: 12,
            boxShadow: "0 8px 24px rgba(2,6,23,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontWeight: 600 }}>Mobile preview</div>
          <div style={{ width: 280, height: 560, borderRadius: 12, background: "#fff", padding: 0, position: "relative", overflow: "hidden" }}>
            {/* smaller widget inside a simulated mobile device */}
            <ChatWidget embedded={true} />
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
            Use <strong>embed=true</strong> param to open by default when embedding.
          </div>
        </div>
      </div>
    </div>
  );
}
