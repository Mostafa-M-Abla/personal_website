(function () {
  const API_URL = "https://chatbot-personal-website.fly.dev/chat/stream";
  const ASSISTANT_NAME = "Mostafa's AI Assistant";
  const ASSISTANT_STATUS = "";
  const AVATAR_URL = "https://mostafaabla.com/assets/assistant_3.png";
  // ^ Replace with your own. If you don’t have one, leave it empty "".

  // ---------- Helpers ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  // ---------- Inject CSS if not included ----------
  // (Optional safety: if you forget to include chat-widget.css, it still works.)
  if (!document.querySelector('link[data-chat-widget-css="1"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/chat_widget/chat-widget.css";
    link.setAttribute("data-chat-widget-css", "1");
    document.head.appendChild(link);
  }

  // ---------- Launcher ----------
  const launcher = el("button", "cw-launcher");
  launcher.setAttribute("aria-label", "Open chat");
  launcher.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c-5 0-9 3.6-9 8 0 2.3 1.1 4.4 3 5.9V21l3.3-1.8c.9.2 1.8.3 2.7.3 5 0 9-3.6 9-8s-4-8-9-8zm-4 9h8v2H8v-2zm0-4h8v2H8V8z"></path>
    </svg>
  `;
  document.body.appendChild(launcher);
  
  // --- Session persistence keys ---
  const SESSION_ID_KEY = "cw_session_id_v1";
  const HISTORY_KEY    = "cw_history_v1";

  // --- Nudge: show hint + pulse once until user opens chat ---
	const NUDGE_SESSION_KEY = "cw_nudge_dismissed_session_v1";


	function showNudge() {
	  if (sessionStorage.getItem(NUDGE_SESSION_KEY) === "1") return;

	  launcher.classList.add("cw-pulse");
	  setTimeout(() => launcher.classList.remove("cw-pulse"), 8000);

	  const hint = document.createElement("div");
	  hint.className = "cw-hint";
	  hint.innerHTML = `
		<div>
		  <strong>Questions about Mostafa?</strong>
		  <p>Ask me about his education, experience, projects, skills, or how he can help your team.</p>
		</div>
		<button class="cw-hint-close" aria-label="Dismiss">×</button>
	  `;
	  document.body.appendChild(hint);

	  // If user closes hint → mark dismissed for this session
	  hint.querySelector(".cw-hint-close").addEventListener("click", () => {
		sessionStorage.setItem(NUDGE_SESSION_KEY, "1");
		hint.remove();
	  });

	  // Auto-hide after 12s (but still allow it to show again if not dismissed)
	  setTimeout(() => {
		if (hint.isConnected) hint.remove();
	  }, 12000);
	}


	// Show nudge shortly after load
	setTimeout(showNudge, 1200);

  // ---------- Panel ----------
  let panel = null;
  let isOpen = false;
  let isWaiting = false;
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY) || null;

  function buildPanel() {
    panel = el("div", "cw-panel");

    const header = el("div", "cw-header");

    const avatar = el("div", "cw-avatar");
    avatar.innerHTML = AVATAR_URL
      ? `<img alt="${escapeHtml(ASSISTANT_NAME)}" src="${escapeHtml(AVATAR_URL)}" />`
      : "";

    const title = el("div", "cw-title");
    title.innerHTML = `<strong>${escapeHtml(ASSISTANT_NAME)}</strong><span>${escapeHtml(ASSISTANT_STATUS)}</span>`;

    const actions = el("div", "cw-header-actions");

    const btnMin = el("button", "cw-iconbtn");
    btnMin.setAttribute("aria-label", "Minimize");
    btnMin.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 11h12v2H6z"></path>
      </svg>
    `;

    const btnReset = el("button", "cw-iconbtn");
    btnReset.setAttribute("aria-label", "Reset chat");
    btnReset.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5V2L8 6l4 4V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"></path>
      </svg>
    `;

    actions.appendChild(btnReset);
    actions.appendChild(btnMin);

    header.appendChild(avatar);
    header.appendChild(title);
    header.appendChild(actions);

    const body = el("div", "cw-body");

    const footer = el("div", "cw-footer");
    const input = el("input", "cw-input");
    input.placeholder = "Type a question…";
    input.autocomplete = "off";

    const send = el("button", "cw-send");
    send.textContent = "Send";

    footer.appendChild(input);
    footer.appendChild(send);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);

    // Restore or start conversation
    const storedHistory = [];
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (raw) storedHistory.push(...JSON.parse(raw));
    } catch {}

    if (storedHistory.length === 0) {
      addMsg(body, "bot", "Hi! Ask me about Mostafa's experience, projects, skills or education 😀");
    } else {
      storedHistory.forEach(({ who, text }) => addMsg(body, who, text));
    }

    // Handlers
    function setWaiting(waiting) {
      isWaiting = waiting;
      send.disabled = waiting;
      input.disabled = waiting;
      if (!waiting) input.focus();
    }

    async function doSend() {
      const msg = input.value.trim();
      if (!msg || isWaiting) return;
      const sugg = body.querySelector(".cw-suggestions");
      if (sugg) sugg.remove();

      addMsg(body, "user", msg);
      saveToHistory("user", msg);
      input.value = "";

      // Show typing indicator
      const typingEl = addTyping(body);

      setWaiting(true);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, session_id: sessionId }),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }

        // Remove typing indicator and create an empty bot bubble
        typingEl.remove();
        const botRow = addMsg(body, "bot", "");
        const bubble = botRow.querySelector(".cw-bubble");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last (possibly incomplete) line in the buffer
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let parsed;
            try { parsed = JSON.parse(line.slice(6)); } catch { continue; }

            if (parsed.token) {
              fullText += parsed.token;
              bubble.innerHTML = escapeHtml(fullText);
              scrollToBottom(body);
            } else if (parsed.done && parsed.session_id) {
              sessionId = parsed.session_id;
              sessionStorage.setItem(SESSION_ID_KEY, sessionId);
            } else if (parsed.error) {
              bubble.innerHTML = escapeHtml("Error: " + parsed.error);
            }
          }
        }

        if (!fullText) bubble.innerHTML = escapeHtml("(no reply)");
        else saveToHistory("bot", fullText);
      } catch (e) {
        if (typingEl.parentNode) typingEl.remove();
        addMsg(body, "bot", "Sorry — I couldn't reach the server.");
      } finally {
        setWaiting(false);
        scrollToBottom(body);
      }
    }

    // Suggestion chips — only for fresh conversations, removed after first use
    if (storedHistory.length === 0) {
      const suggestions = el("div", "cw-suggestions");
      ["Where did Mostafa work most recently?",
       "Which Languages does Mostafa speak?",
       "Does Mostafa have Leadership experience?"].forEach(q => {
        const btn = el("button", "cw-suggestion-btn");
        btn.textContent = q;
        btn.addEventListener("click", () => {
          suggestions.remove();
          input.value = q;
          doSend();
        });
        suggestions.appendChild(btn);
      });
      body.appendChild(suggestions);
    }

    send.addEventListener("click", doSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSend();
    });

    btnMin.addEventListener("click", closePanel);

    btnReset.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(HISTORY_KEY);
      sessionId = null;

      body.innerHTML = "";
      addMsg(body, "bot", "Hi! Ask me about Mostafa's experience, projects, skills, ... 🙂");

      const suggestions = el("div", "cw-suggestions");
      ["Where did Mostafa work most recently?",
       "Which Languages does Mostafa speak?",
       "Does Mostafa have Leadership experience?"].forEach(q => {
        const btn = el("button", "cw-suggestion-btn");
        btn.textContent = q;
        btn.addEventListener("click", () => {
          suggestions.remove();
          input.value = q;
          doSend();
        });
        suggestions.appendChild(btn);
      });
      body.appendChild(suggestions);
    });

    // Small UX: open focuses input
    setTimeout(() => input.focus(), 50);

    return panel;
  }

  function saveToHistory(who, text) {
    let history = [];
    try { history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]"); } catch {}
    history.push({ who, text });
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function addMsg(container, who, text) {
    const row = el("div", `cw-msg ${who === "user" ? "cw-user" : ""}`);

    const bubble = el("div", "cw-bubble");
    bubble.innerHTML = escapeHtml(text);

    row.appendChild(bubble);
    container.appendChild(row);
    scrollToBottom(container);
    return row;
  }

  function addTyping(container) {
    const row = el("div", "cw-msg");
    const bubble = el("div", "cw-bubble");

    bubble.innerHTML = `
      <span class="cw-typing" aria-label="Assistant typing">
        <span class="cw-dot"></span>
        <span class="cw-dot"></span>
        <span class="cw-dot"></span>
      </span>
    `;

    row.appendChild(bubble);
    container.appendChild(row);
    scrollToBottom(container);
    return row;
  }

	function openPanel() {
	  if (isOpen) return;
	  isOpen = true;

	  // mark nudge as dismissed for this session
	  sessionStorage.setItem(NUDGE_SESSION_KEY, "1");

	  // remove hint if visible
	  const hint = document.querySelector(".cw-hint");
	  if (hint) hint.remove();
	  launcher.classList.remove("cw-pulse");

	  if (!panel) panel = buildPanel();
	  document.body.appendChild(panel);
	}

  function closePanel() {
    isOpen = false;
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
  }

  launcher.addEventListener("click", () => {
    if (isOpen) closePanel();
    else openPanel();
  });

  window.cwOpen = openPanel;
})();
