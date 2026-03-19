(function () {
  const STORAGE_KEY = "topSitesTrayEnabled";
  const MAX_SITES = 14;

  const toggle = document.getElementById("sites-tray-toggle");
  const dockWrap = document.getElementById("sites-dock-wrap");
  const dockList = document.getElementById("sites-dock-list");

  if (!toggle || !dockWrap || !dockList) return;

  const hasChromeStorage =
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local;

  function faviconUrl(pageUrl) {
    try {
      const host = new URL(pageUrl).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
    } catch {
      return "";
    }
  }

  function shortTitle(title, url) {
    const t = (title || "").trim();
    if (t.length > 14) return t.slice(0, 12) + "…";
    if (t) return t;
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Site";
    }
  }

  function renderSites(sites) {
    dockList.textContent = "";
    const frag = document.createDocumentFragment();
    for (const site of sites.slice(0, MAX_SITES)) {
      if (!site.url || site.url.startsWith("chrome://")) continue;

      const a = document.createElement("a");
      a.className = "sites-dock-item";
      a.href = site.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = site.title || site.url;

      const label = document.createElement("span");
      label.className = "sites-dock-name";
      label.textContent = shortTitle(site.title, site.url);

      const fav = faviconUrl(site.url);
      if (fav) {
        const img = document.createElement("img");
        img.className = "sites-dock-favicon";
        img.alt = "";
        img.loading = "lazy";
        img.src = fav;
        img.onerror = function () {
          if (a.querySelector(".sites-dock-fallback")) return;
          this.remove();
          a.classList.add("sites-dock-item--fallback");
          const span = document.createElement("span");
          span.className = "sites-dock-fallback";
          span.textContent = shortTitle(site.title, site.url)
            .charAt(0)
            .toUpperCase();
          a.insertBefore(span, label);
        };
        a.appendChild(img);
      } else {
        a.classList.add("sites-dock-item--fallback");
        const span = document.createElement("span");
        span.className = "sites-dock-fallback";
        span.textContent = shortTitle(site.title, site.url)
          .charAt(0)
          .toUpperCase();
        a.appendChild(span);
      }

      a.appendChild(label);
      frag.appendChild(a);
    }
    dockList.appendChild(frag);
  }

  function loadTopSites() {
    if (!chrome.topSites || typeof chrome.topSites.get !== "function") {
      dockList.innerHTML =
        '<p class="sites-dock-empty">Top sites aren’t available.</p>';
      return;
    }
    chrome.topSites.get(function (sites) {
      if (chrome.runtime.lastError) {
        dockList.innerHTML =
          '<p class="sites-dock-empty">Couldn’t load sites.</p>';
        return;
      }
      if (!sites || !sites.length) {
        dockList.innerHTML =
          '<p class="sites-dock-empty">No top sites yet.</p>';
        return;
      }
      renderSites(sites);
    });
  }

  function applyEnabled(enabled) {
    toggle.setAttribute("aria-checked", enabled ? "true" : "false");
    toggle.classList.toggle("sites-tray-toggle--on", enabled);
    dockWrap.hidden = !enabled;
    document.body.classList.toggle("sites-tray-active", enabled);
    if (enabled) loadTopSites();
  }

  function persistEnabled(enabled, done) {
    if (!hasChromeStorage) {
      done();
      return;
    }
    chrome.storage.local.set({ [STORAGE_KEY]: enabled }, function () {
      if (chrome.runtime.lastError) {
        console.warn("storage.set failed", chrome.runtime.lastError.message);
      }
      done();
    });
  }

  function readInitial(done) {
    if (!hasChromeStorage) {
      done(false);
      return;
    }
    chrome.storage.local.get([STORAGE_KEY], function (res) {
      if (chrome.runtime.lastError) {
        done(false);
        return;
      }
      done(Boolean(res[STORAGE_KEY]));
    });
  }

  readInitial(function (enabled) {
    applyEnabled(enabled);
  });

  toggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggle.getAttribute("aria-checked") !== "true";
    persistEnabled(next, function () {
      applyEnabled(next);
    });
  });
})();
