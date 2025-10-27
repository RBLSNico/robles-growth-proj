(function () {
  if (typeof window === "undefined") return;
  if (window.__shopify_chat_widget_loader_loaded) return;
  window.__shopify_chat_widget_loader_loaded = true;

  function safeDecode(val) {
    try {
      return decodeURIComponent(val || "");
    } catch {
      return val || "";
    }
  }

  function ensureCss(appUrl) {
    try {
      if (document.getElementById("shopify-chat-widget-css")) return;
      var link = document.createElement("link");
      link.id = "shopify-chat-widget-css";
      link.rel = "stylesheet";
      link.href = (appUrl || "") + "/chat-widget.css";
      document.head.appendChild(link);
    } catch (e) {
      /* ignore */
    }
  }

  // Build iframe element that points at the app-hosted preview URL with embed flag.
  function makeIframe(appUrl, settings) {
    var iframe = document.createElement("iframe");
    var src = (appUrl || "") + "/app/chat-widget?embed=true";
    // pass settings via query so the preview route can read them if needed
    var params = new URLSearchParams();
    if (settings) {
      if (settings.position) params.set("position", settings.position);
      if (settings.primaryColor) params.set("primaryColor", settings.primaryColor);
      if (settings.accentColor) params.set("accentColor", settings.accentColor);
      if (settings.greeting) params.set("greeting", settings.greeting);
      if (settings.defaultOpen) params.set("embed", "true");
    }
    var fullSrc = src + (Array.from(params).length ? "&" + params.toString() : "");
    iframe.src = fullSrc;
    iframe.style.width = "100%";
    iframe.style.height = "560px";
    iframe.style.border = "0";
    iframe.style.borderRadius = "12px";
    iframe.style.boxSizing = "border-box";
    iframe.style.display = "block";
    iframe.setAttribute("aria-hidden", "false");
    return iframe;
  }

  // Insert a floating iframe in the corner for simple script-tag integration
  function injectFloatingIframe(appUrl, settings) {
    ensureCss(appUrl);
    var wrapperId = "shopify-chat-widget-floating";
    if (document.getElementById(wrapperId)) return;
    var wrapper = document.createElement("div");
    wrapper.id = wrapperId;
    wrapper.style.position = "fixed";
    wrapper.style.right = settings && settings.position === "bl" ? "auto" : "16px";
    wrapper.style.left = settings && settings.position === "bl" ? "16px" : "auto";
    wrapper.style.bottom = "16px";
    wrapper.style.zIndex = "999999";
    wrapper.style.width = "360px";
    wrapper.style.maxWidth = "calc(100% - 32px)";

    var iframe = makeIframe(appUrl, settings);
    iframe.style.height = "520px";
    iframe.style.width = "100%";
    iframe.style.boxShadow = "0 10px 30px rgba(16,24,40,0.12)";

    // toggle button
    var btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = "Close";
    btn.style.position = "absolute";
    btn.style.top = "8px";
    btn.style.right = "8px";
    btn.style.zIndex = "1000000";
    btn.style.background = "rgba(255,255,255,0.9)";
    btn.style.border = "none";
    btn.style.padding = "6px 8px";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", function () {
      // simple close: remove wrapper
      wrapper.remove();
    });

    wrapper.appendChild(iframe);
    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);
  }

  // Mount into placeholder element(s) used by Theme App Embed
  function mountEmbeds(appUrl) {
    ensureCss(appUrl);
    var nodes = document.querySelectorAll("[data-shopify-chat-widget]");
    nodes.forEach(function (el) {
      // If already mounted, skip
      if (el.getAttribute("data-chat-mounted") === "1") return;

      var settings = {
        enabled: el.getAttribute("data-enabled"),
        defaultOpen: el.getAttribute("data-default-open"),
        position: el.getAttribute("data-position"),
        primaryColor: el.getAttribute("data-primary-color"),
        accentColor: el.getAttribute("data-accent-color"),
        greeting: safeDecode(el.getAttribute("data-greeting")),
      };

      // If disabled explicitly, do nothing
      if (settings.enabled === "false" || settings.enabled === "0") {
        el.setAttribute("data-chat-mounted", "1");
        return;
      }

      // Insert iframe into the element (full width)
      var iframe = makeIframe(appUrl, settings);
      // adapt iframe height to element size or default
      iframe.style.height = el.getAttribute("data-height") || "520px";
      iframe.style.border = "0";
      ifaceSafeAppend(el, iframe);

      el.setAttribute("data-chat-mounted", "1");
    });
  }

  function ifaceSafeAppend(el, child) {
    try {
      el.innerHTML = "";
      el.appendChild(child);
    } catch (e) {
      // fallback: append to body
      document.body.appendChild(child);
    }
  }

  // main init: determine appUrl and settings from script tag or default
  function init() {
    try {
      var currentScript = document.currentScript;
      if (!currentScript) {
        var scripts = document.getElementsByTagName("script");
        currentScript = scripts[scripts.length - 1];
      }
      var appUrl = (currentScript && currentScript.getAttribute("data-app-url")) || "";
      // if there are explicit placeholders, mount them
      var hasPlaceholders = document.querySelector("[data-shopify-chat-widget]") !== null;
      if (hasPlaceholders) {
        mountEmbeds(appUrl);
        return;
      }

      // fallback: try to read data attributes from the script tag
      var settings = null;
      if (currentScript) {
        settings = {
          enabled: currentScript.getAttribute("data-enabled"),
          defaultOpen: currentScript.getAttribute("data-default-open"),
          position: currentScript.getAttribute("data-position"),
          primaryColor: currentScript.getAttribute("data-primary-color"),
          accentColor: currentScript.getAttribute("data-accent-color"),
          greeting: safeDecode(currentScript.getAttribute("data-greeting")),
        };
      }

      // If enabled explicitly false, don't inject
      if (settings && (settings.enabled === "false" || settings.enabled === "0")) {
        return;
      }

      // Inject a floating iframe for simple use-cases
      injectFloatingIframe(appUrl, settings);
    } catch (e) {
      // safe fail
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
