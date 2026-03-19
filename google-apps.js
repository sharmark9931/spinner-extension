(function () {
  const btn = document.getElementById("google-apps-btn");
  const panel = document.getElementById("google-apps-panel");
  if (!btn || !panel) return;

  function open() {
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("google-apps-open");
  }

  function close() {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("google-apps-open");
  }

  function toggle() {
    if (panel.hidden) open();
    else close();
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener("click", (e) => {
    if (panel.hidden) return;
    const t = e.target;
    if (btn.contains(t) || panel.contains(t)) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      close();
      btn.focus();
    }
  });
})();
