(function () {
  try {
    if (window.__shopify_chat_widget_loaded) return;
    window.__shopify_chat_widget_loaded = true;

    var currentScript = document.currentScript || (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

    var appUrl = (currentScript && currentScript.getAttribute("data-app-url")) || (currentScript && currentScript.src && currentScript.src.split("/").slice(0,3).join("/")) || "";

    var cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = (appUrl ? appUrl : "") + "/chat-widget.css";
    document.head.appendChild(cssLink);

    var root = document.createElement("div");
    root.id = "shopify-chat-widget-root";
    document.body.appendChild(root);

    var wrapper = document.createElement("div");
    wrapper.id = "shopify-chat-widget-wrapper";
    wrapper.style.position = "fixed";
    wrapper.style.right = "16px";
    wrapper.style.bottom = "16px";
    wrapper.style.zIndex = "999999";
    root.appendChild(wrapper);

    var open = false;
    var iframe = document.createElement("iframe");
    iframe.style.width = "360px";
    iframe.style.height = "520px";
    iframe.style.border = "0";
    iframe.style.borderRadius = "12px";
    iframe.style.boxShadow = "0 10px 30px rgba(16,24,40,0.12)";
    iframe.style.display = "none";
    iframe.style.background = "white";

    var btn = document.createElement("button");
    btn.id = "shopify-chat-widget-button";
    btn.innerText = "Chat";
    btn.style.height = "56px";
    btn.style.width = "56px";
    btn.style.borderRadius = "999px";
    btn.style.border = "none";
    btn.style.background = "linear-gradient(90deg,#5b8def,#7b61ff)";
    btn.style.color = "white";
    btn.style.boxShadow = "0 6px 18px rgba(16,24,40,0.12)";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "600";

    btn.addEventListener("click", function () {
      open = !open;
      if (open) {
        iframe.style.display = "block";
        btn.innerText = "×";
      } else {
        iframe.style.display = "none";
        btn.innerText = "Chat";
      }
    });

    wrapper.appendChild(iframe);
    wrapper.appendChild(btn);

    // build iframe src: ensure absolute url
    var embedUrl = (appUrl ? appUrl : "") + "/app/chat-widget?embed=true";
    iframe.src = embedUrl;
  } catch (e) {
    console.error("chat widget init error", e);
  }
})();
