<script>
(function () {
  const API_URL = "https://yourname-chat-api.fly.dev/chat"; // change later to https://api.yourdomain.com/chat

  // Basic UI
  const box = document.createElement("div");
  box.style.position = "fixed";
  box.style.right = "20px";
  box.style.bottom = "20px";
  box.style.width = "320px";
  box.style.border = "1px solid #ccc";
  box.style.borderRadius = "12px";
  box.style.background = "white";
  box.style.boxShadow = "0 6px 24px rgba(0,0,0,0.15)";
  box.style.fontFamily = "system-ui, Arial";
  box.style.overflow = "hidden";
  box.style.zIndex = "9999";

  box.innerHTML = `
    <div style="padding:10px 12px; font-weight:600; border-bottom:1px solid #eee;">
      Chat with me
    </div>
    <div id="chat-log" style="height:220px; padding:10px 12px; overflow:auto; font-size:14px;"></div>
    <div style="display:flex; gap:8px; padding:10px 12px; border-top:1px solid #eee;">
      <input id="chat-input" placeholder="Type a number…" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:8px;" />
      <button id="chat-send" style="padding:8px 10px; border:1px solid #ccc; border-radius:8px; background:#f7f7f7; cursor:pointer;">Send</button>
    </div>
  `;

  document.body.appendChild(box);

  const log = box.querySelector("#chat-log");
  const input = box.querySelector("#chat-input");
  const btn = box.querySelector("#chat-send");

  function addLine(who, text) {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `<b>${who}:</b> ${String(text).replace(/</g, "&lt;")}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  async function send() {
    const msg = input.value.trim();
    if (!msg) return;

    addLine("You", msg);
    input.value = "";
    btn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }

      const data = await res.json();
      addLine("Bot", data.reply ?? "(no reply)");
    } catch (e) {
      addLine("Bot", "Error: " + (e && e.message ? e.message : String(e)));
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }

  btn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });
})();
</script>
