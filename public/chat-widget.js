(function () {
  if (typeof window === "undefined") return;
  if (window.__shopify_chat_widget_loader_loaded) return;
  window.__shopify_chat_widget_loader_loaded = true;

  // wrapper id used by CSS and to avoid duplicate injection
  var wrapperId = "shopify-chat-widget-wrapper";

  function safeDecode(val) {
    try {
      return decodeURIComponent(val || "");
    } catch {
      return val || "";
    }
  }

  // Inline CSS fallback to ensure widget styles apply in storefronts
  const INLINE_CHAT_WIDGET_CSS = `
  .scw-floating { font-family: Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial; pointer-events: auto; }
  .scw-root { box-sizing: border-box; background: linear-gradient(180deg, #ffffff, #fbfbff); border-radius: 12px; box-shadow: 0 10px 30px rgba(16,24,40,0.12); overflow: hidden; display: flex; flex-direction: column; transform-origin: bottom right; transition: transform 220ms cubic-bezier(.2,.8,.2,1), opacity 180ms ease, width 220ms ease; border: 1px solid rgba(16,24,40,0.05); color: #0b1228; transform: translateY(8px) scale(0.985); opacity: 0; }
  .scw-root.scw-open { transform: translateY(0) scale(1); opacity: 1; }
  /* closed (compact) visual */
  .scw-root[data-open="false"] { width: 56px; height: 56px; border-radius: 999px; overflow: visible; padding: 0; display: block; transform: scale(1); opacity: 1; }
  .scw-header { display: flex; align-items: center; justify-content: space-between; padding: 12px; gap: 8px; color: white; cursor: pointer; }
  .scw-header-text { display: flex; flex-direction: column; }
  .scw-title { font-weight: 700; font-size: 13px; line-height: 1; }
  .scw-subtitle { font-size: 11px; opacity: 0.95; }
  .scw-toggle { background: rgba(255,255,255,0.12); border: none; color: white; padding: 6px 8px; border-radius: 8px; cursor: pointer; font-size: 16px; line-height: 1; }
  .scw-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow: auto; background: linear-gradient(180deg, rgba(11,20,40,0.02), transparent); }
  .scw-msg { padding: 8px 12px; border-radius: 12px; max-width: 85%; box-shadow: 0 1px 2px rgba(16,24,40,0.04); font-size: 13px; margin-bottom: 8px; transform: translateY(6px); opacity: 0; transition: transform 240ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease; }
  .scw-msg.show { transform: translateY(0); opacity: 1; }
  .scw-msg-assistant { align-self: flex-start; background: #f4f6ff; color: #0b1228; }
  .scw-msg-user { align-self: flex-end; color: white; background: linear-gradient(90deg,#5b8def,#7b61ff); }
  .scw-footer { display: flex; gap: 8px; padding: 10px; border-top: 1px solid rgba(16,24,40,0.03); background: rgba(255,255,255,0.9); align-items: center; }
  .scw-input { flex: 1; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(16,24,40,0.06); resize: none; font-size: 13px; min-height: 36px; max-height: 90px; outline: none; }
  .scw-send { background: linear-gradient(90deg, #5b8def, #7b61ff); border: none; color: white; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; }
  /* mini icon (closed state) */
  .scw-mini-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: none;
    align-items: center;
    justify-content: center;
    background: white;
    box-shadow: 0 4px 12px rgba(2,6,23,0.08);
    overflow: hidden;
  }
  .scw-mini-icon img, .scw-mini-icon svg { width: 22px; height: 22px; display: block; }
  /* show mini icon when closed */
  .scw-root[data-open="false"] .scw-mini-icon { display: flex; }
  /* hide header text when closed */
  .scw-root[data-open="false"] .scw-header-text { display: none; }
  @media (max-width:520px){ .scw-root[data-open="true"]{ left:12px !important; right:12px !important; width:auto !important; max-width:none !important; bottom:12px !important } .scw-root[data-open="false"]{ right:12px !important; bottom:12px !important } }
  `;

  function ensureCss(appUrl) {
    try {
      // If external CSS is already present, skip
      if (document.getElementById("shopify-chat-widget-css")) return;

      // Try to load external CSS from the app host (best effort)
      var link = document.createElement("link");
      link.id = "shopify-chat-widget-css";
      link.rel = "stylesheet";
      link.href = (appUrl || "") + "/chat-widget.css";
      // onerror: fall back to inline CSS
      link.onerror = function () {
        if (!document.getElementById("shopify-chat-widget-inline-css")) {
          var style = document.createElement("style");
          style.id = "shopify-chat-widget-inline-css";
          style.appendChild(document.createTextNode(INLINE_CHAT_WIDGET_CSS));
          document.head.appendChild(style);
        }
      };
      document.head.appendChild(link);

      // Also inject inline CSS immediately as a reliable fallback (harmless if external loads)
      if (!document.getElementById("shopify-chat-widget-inline-css")) {
        var styleImmediate = document.createElement("style");
        styleImmediate.id = "shopify-chat-widget-inline-css";
        styleImmediate.appendChild(document.createTextNode(INLINE_CHAT_WIDGET_CSS));
        document.head.appendChild(styleImmediate);
      }
    } catch (e) {
      // final fallback: inject inline style directly
      if (!document.getElementById("shopify-chat-widget-inline-css")) {
        var style = document.createElement("style");
        style.id = "shopify-chat-widget-inline-css";
        style.appendChild(document.createTextNode(INLINE_CHAT_WIDGET_CSS));
        document.head.appendChild(style);
      }
    }
  }

  function createNode(html) {
    var template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  function mountWidget(settings) {
    if (!settings || settings.enabled === "false" || settings.enabled === "0") return;

    // persistence for open state
    var open = settings.persistOpen ? (localStorage.getItem("scw_open") === "true") : (settings.defaultOpen === "true" || settings.defaultOpen === true || settings.embedded === true);

    // wrapper positioning uses offsets
    var wrapper = document.createElement("div");
    wrapper.id = wrapperId;
    wrapper.className = "scw-floating";
    wrapper.style.position = "fixed";
    wrapper.style.zIndex = "999999";
    wrapper.style.width = "360px";
    wrapper.style.maxWidth = "calc(100% - 32px)";
    wrapper.style.boxSizing = "border-box";

    var right = settings.offsetRight || 16;
    var bottom = settings.offsetBottom || 16;

    if (settings.position === "bl") {
      wrapper.style.left = right + "px";
      wrapper.style.right = "auto";
      wrapper.style.bottom = bottom + "px";
    } else {
      wrapper.style.right = right + "px";
      wrapper.style.left = "auto";
      wrapper.style.bottom = bottom + "px";
    }

    var root = createNode(
      '<div id="shopify-chat-widget-root" class="scw-root" data-open="false" aria-hidden="false"></div>',
    );

    // header + body + footer
    var header = createNode(
      '<div class="scw-header" role="button" aria-label="Chat header" tabindex="0"></div>',
    );
    // header text
    var headerText = document.createElement("div");
    headerText.className = "scw-header-text";
    headerText.innerHTML = '<div class="scw-title">Instant Checkout Help</div><div class="scw-subtitle">Get help using Instant Checkout</div>';
    header.appendChild(headerText);

    // mini icon (visible when closed). allow override via settings.iconUrl
    var miniIcon = document.createElement("div");
    miniIcon.className = "scw-mini-icon";
    if (settings.iconUrl) {
      var img = document.createElement("img");
      img.src = settings.iconUrl;
      img.alt = "Chat";
      miniIcon.appendChild(img);
    } else {
      // default inline SVG
      miniIcon.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3C7.03 3 3 6.69 3 11c0 1.9.73 3.66 1.99 5.12L4 21l4.18-1.4C9.03 19.83 10.5 20 12 20c4.97 0 9-3.69 9-8s-4.03-9-9-9z" fill="#5B8DEF"/></svg>';
    }
    header.appendChild(miniIcon);

    var toggleBtn = document.createElement("button");
    toggleBtn.className = "scw-toggle";
    toggleBtn.type = "button";
    toggleBtn.innerText = settings.defaultOpen === "true" || settings.defaultOpen === true ? "−" : "✚";
    header.appendChild(toggleBtn);

    var body = createNode('<div class="scw-body" role="log" aria-live="polite"></div>');
    body.style.maxHeight = "320px";
    body.style.overflow = "auto";

    var footer = createNode('<div class="scw-footer"></div>');
    var input = document.createElement("textarea");
    input.className = "scw-input";
    input.placeholder = "Ask about Instant Checkout...";
    input.rows = 1;
    var send = document.createElement("button");
    send.className = "scw-send";
    send.type = "button";
    send.innerText = "Send";

    footer.appendChild(input);
    footer.appendChild(send);

    root.appendChild(header);
    root.appendChild(body);
    root.appendChild(footer);
    wrapper.appendChild(root);
    document.body.appendChild(wrapper);

    // apply colors + avatar
    var primary = settings.primaryColor || "#5b8def";
    var accent = settings.accentColor || "#7b61ff";
    header.style.background = "linear-gradient(90deg," + primary + " 0%," + accent + " 100%)";
    toggleBtn.style.background = "rgba(255,255,255,0.12)";

    // avatar override
    if (settings.avatarUrl) {
      var img = document.createElement("img");
      img.src = settings.avatarUrl;
      img.alt = "Chat";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.borderRadius = settings.borderRadius ? settings.borderRadius + "px" : "10px";
      // replace miniIcon content
      miniIcon.innerHTML = "";
      miniIcon.appendChild(img);
    }

    // basic message render helper (initial greeting + simple append)
    function renderMessages() {
      try {
        body.innerHTML = "";
        var msg = document.createElement("div");
        msg.className = "scw-msg scw-msg-assistant show";
        msg.textContent = settings.greeting || "Hi — how can I help?";
        body.appendChild(msg);
      } catch (e) {
        // ignore render errors
      }
    }

    // basic interaction handlers
    header.addEventListener("click", function () {
      setOpen(!open);
    });
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!open);
    });
    send.addEventListener("click", function () {
      var text = input.value && input.value.trim();
      if (!text) return;
      var um = document.createElement("div");
      um.className = "scw-msg scw-msg-user show";
      um.textContent = text;
      body.appendChild(um);
      input.value = "";
      body.scrollTop = body.scrollHeight;
      // simulated assistant reply
      setTimeout(function () {
        var am = document.createElement("div");
        am.className = "scw-msg scw-msg-assistant show";
        am.textContent = "Thanks! Instant Checkout lets customers complete purchases directly in chat. (Demo reply)";
        body.appendChild(am);
        body.scrollTop = body.scrollHeight;
      }, 600);
    });

    // state handling with persistence + analytics
    function saveOpenState(val) {
      try {
        if (settings.persistOpen) localStorage.setItem("scw_open", String(val));
      } catch {}
      // analytics
      try {
        if (settings.analyticsEndpoint) {
          var payload = JSON.stringify({ event: val ? "open" : "close", timestamp: Date.now() });
          if (navigator.sendBeacon) {
            navigator.sendBeacon(settings.analyticsEndpoint, payload);
          } else {
            fetch(settings.analyticsEndpoint, { method: "POST", body: payload, headers: { "Content-Type": "application/json" } }).catch(() => {});
          }
        }
      } catch {}
    }

    function setOpen(val) {
      open = Boolean(val);
      root.setAttribute("data-open", open ? "true" : "false");
      toggleBtn.innerText = open ? "−" : "✚";
      if (open) {
        // animate open
        root.classList.add("scw-open");
        // ensure inner areas visible after a short delay so transitions run
        setTimeout(function () {
          body.style.display = "block";
          footer.style.display = "flex";
          body.scrollTop = body.scrollHeight;
        }, 18);
        saveOpenState(true);
      } else {
        // animate close
        root.classList.remove("scw-open");
        // wait for transition before hiding inner content to keep smooth animation
        setTimeout(function () {
          body.style.display = "none";
          footer.style.display = "none";
        }, 220);
        saveOpenState(false);
      }
    }

    // minimize on scroll helper
    if (settings.minimizeOnScroll) {
      function onScroll() {
        if (window.scrollY > 200) setOpen(false);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      // cleanup not strictly necessary in short-lived public script, but keep safe
      // (no reference to remove later in this simple loader)
    }

    // initial render
    renderMessages();
    setOpen(open);
  }

  // main init
  function init() {
    try {
      // Prefer the actual chat-widget.js <script> tag (works when document.currentScript is null)
      var currentScript = document.currentScript;
      if (!currentScript || !currentScript.getAttribute) {
        var scripts = document.getElementsByTagName("script");
        // Search for a script whose src contains 'chat-widget.js' (walk backwards to prefer later inclusions)
        for (var i = scripts.length - 1; i >= 0; i--) {
          try {
            var s = scripts[i];
            var src = s.getAttribute && s.getAttribute("src");
            if (src && src.indexOf("chat-widget.js") !== -1) {
              currentScript = s;
              break;
            }
          } catch (e) {
            // ignore and continue searching
          }
        }
        // final fallback: last script on the page
        if (!currentScript) {
          currentScript = scripts[scripts.length - 1];
        }
      }

      var appUrl = (currentScript && currentScript.getAttribute("data-app-url")) || "";
      ensureCss(appUrl);

      // read settings from script attributes
      var settings = {
        enabled: currentScript?.getAttribute("data-enabled") ?? "true",
        defaultOpen: currentScript?.getAttribute("data-default-open") ?? "false",
        position: currentScript?.getAttribute("data-position") ?? "br",
        primaryColor: currentScript?.getAttribute("data-primary-color") ?? undefined,
        accentColor: currentScript?.getAttribute("data-accent-color") ?? undefined,
        greeting: safeDecode(currentScript?.getAttribute("data-greeting")),
        embedded: currentScript?.getAttribute("data-default-open") === "true" || currentScript?.getAttribute("data-embed") === "true",
        // optional icon override
        iconUrl: currentScript?.getAttribute("data-icon-url") ?? undefined,
        // new attributes
        avatarUrl: safeDecode(currentScript?.getAttribute("data-avatar-url")) || undefined,
        minimizeOnScroll: currentScript?.getAttribute("data-minimize-on-scroll") === "true",
        persistOpen: currentScript?.getAttribute("data-persist-open") === "true",
        analyticsEndpoint: safeDecode(currentScript?.getAttribute("data-analytics-endpoint")) || undefined,
        offsetRight: parseInt(currentScript?.getAttribute("data-offset-right") || "16", 10),
        offsetBottom: parseInt(currentScript?.getAttribute("data-offset-bottom") || "16", 10),
        size: parseInt(currentScript?.getAttribute("data-size") || "56", 10),
        borderRadius: parseInt(currentScript?.getAttribute("data-border-radius") || "12", 10),
        locale: currentScript?.getAttribute("data-locale") || "en",
      };

      // If disabled explicitly false, don't inject
      if (settings.enabled === "false" || settings.enabled === "0") return;

      mountWidget(settings);
    } catch (e) {
      console.error("chat-widget loader error", e);
    }
  }

  // DOM ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 0);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
