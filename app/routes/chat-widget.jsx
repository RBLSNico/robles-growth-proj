import { useLoaderData } from "react-router";
import ChatWidget from "../components/ChatWidget";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  return { embedded: url.searchParams.get("embed") === "true" };
};

export default function ChatWidgetEmbedPage() {
  const { embedded } = useLoaderData();

  return (
    <div style={{ padding: 12, fontFamily: "Inter, system-ui, -apple-system, Roboto, Arial" }}>
      <div style={{ maxWidth: "100%", minHeight: 320, position: "relative" }}>
        <ChatWidget embedded={embedded || true} />
      </div>
    </div>
  );
}

// Dev-only: allow embedding from any origin. Replace * with specific shop origin(s) for production.
export const headers = () => {
  return {
    "X-Frame-Options": "ALLOWALL",
    "Content-Security-Policy": "frame-ancestors *",
  };
};
