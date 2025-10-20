import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import ChatWidget from "../components/ChatWidget";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Inter, system-ui, -apple-system, Roboto, Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Chat widget — Preview</h1>
      <p style={{ marginTop: 6, color: "#374151" }}>
        This page is the app preview for the embeddable Chat widget. The widget is
        shown open by default for inspection.
      </p>

      <div
        style={{
          marginTop: 20,
          position: "relative",
          minHeight: 420,
          borderRadius: 12,
          background: "linear-gradient(180deg, #ffffff, #fbfbff)",
          padding: 20,
          boxShadow: "0 8px 24px rgba(16,24,40,0.06)",
        }}
      >
        {/* Render the Chat widget directly in the app preview */}
        <ChatWidget embedded={true} />
      </div>
    </div>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error();
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
