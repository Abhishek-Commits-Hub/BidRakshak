const STORAGE_KEY = "bidrakshak-demo-state";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSelectedLanguage() {
  return (getAppState().selectedLanguage || "en");
}

function setSelectedLanguage(lang) {
  const state = getAppState();
  state.selectedLanguage = lang;
  persistState();
}

function switchLanguageWithAnimation(lang, renderView) {
  if (lang === getSelectedLanguage()) return;

  const app = document.getElementById("app");
  clearTimeout(window.languageTransitionTimer);
  app?.classList.remove("language-transition");
  setSelectedLanguage(lang);
  document.documentElement.lang = lang;
  renderView();
  app?.classList.add("language-transition");
  window.languageTransitionTimer = setTimeout(() => {
    app?.classList.remove("language-transition");
  }, 380);
}

function getSelectedTheme() {
  return (getAppState().selectedTheme || "light");
}

function setSelectedTheme(theme) {
  const state = getAppState();
  state.selectedTheme = theme === "dark" ? "dark" : "light";
  persistState();
  document.body.dataset.theme = state.selectedTheme;
  document.documentElement.dataset.theme = state.selectedTheme;
}

function getAppState() {
  if (!window.__bidrakshakState) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.__bidrakshakState = clone(DEFAULT_STATE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.__bidrakshakState));
      return window.__bidrakshakState;
    }

    try {
      window.__bidrakshakState = JSON.parse(raw);
    } catch (error) {
      window.__bidrakshakState = clone(DEFAULT_STATE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.__bidrakshakState));
    }
  }

  return window.__bidrakshakState;
}

function persistState() {
  if (!window.__bidrakshakState) {
    window.__bidrakshakState = clone(DEFAULT_STATE);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.__bidrakshakState));
}

function resetDemoState() {
  window.__bidrakshakState = clone(DEFAULT_DATA.appState);
  persistState();
  renderApp();
}

function createStatusBadge(status, type) {
  const statusKey = String(status || "").toLowerCase().replace(/\s+/g, "-");
  const className = statusKey.includes("needs") || statusKey.includes("review") ? "needs-review" :
    statusKey.includes("verified") || statusKey.includes("complete") ? "verified" :
    statusKey.includes("non") || statusKey.includes("rejected") ? "non-compliant" : "verified";

  if (type === "risk") {
    const riskKey = String(status || "").toLowerCase();
    return `<span class="badge ${riskKey.includes("high") ? "high" : riskKey.includes("medium") ? "medium" : "low"}">${status}</span>`;
  }

  return `<span class="badge ${className}">${status}</span>`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function getTenderById(id) {
  const tenders = DEFAULT_DATA.tenders;
  return tenders.find((t) => t.id === id) || tenders[0];
}

function getBidById(id) {
  return DEFAULT_DATA.bids.find((b) => b.id === id) || DEFAULT_DATA.bids[0];
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    const div = document.createElement("div");
    div.id = "toast";
    div.className = "toast";
    document.body.appendChild(div);
  }
  const target = document.getElementById("toast");
  target.textContent = message;
  target.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => target.classList.remove("show"), 2200);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("show");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("show");
}

function bindNotificationPopover() {
  const toggle = document.querySelector("[data-notifications-toggle]");
  const popover = document.getElementById("notificationPopover");
  if (!toggle || !popover) return;

  const closePopover = () => {
    popover.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 520px)").matches) {
      popover.style.top = `${toggle.getBoundingClientRect().bottom + 10}px`;
    } else {
      popover.style.top = "";
    }
    const isOpen = popover.classList.toggle("show");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  popover.querySelector("[data-notifications-close]")?.addEventListener("click", closePopover);

  if (!window.__bidrakshakNotificationDismissBound) {
    document.addEventListener("click", (event) => {
      const menu = document.querySelector(".notification-menu");
      if (menu && !menu.contains(event.target)) {
        const panel = menu.querySelector(".notification-popover");
        const button = menu.querySelector("[data-notifications-toggle]");
        panel?.classList.remove("show");
        button?.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const menu = document.querySelector(".notification-menu");
        menu?.querySelector(".notification-popover")?.classList.remove("show");
        menu?.querySelector("[data-notifications-toggle]")?.setAttribute("aria-expanded", "false");
      }
    });
    window.__bidrakshakNotificationDismissBound = true;
  }
}

function bindMobileNavigation() {
  const toggle = document.querySelector("[data-mobile-nav-toggle]");
  const sidebar = toggle?.closest(".sidebar");
  const nav = sidebar?.querySelector(".nav-section");
  if (!toggle || !sidebar || !nav) return;

  const syncInert = () => {
    nav.inert = window.matchMedia("(max-width: 820px)").matches &&
      toggle.getAttribute("aria-expanded") !== "true";
  };

  const setOpen = (isOpen) => {
    sidebar.classList.toggle("mobile-nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    syncInert();
    const label = t(isOpen ? "closeMenu" : "menu");
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
  };

  syncInert();

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  if (!window.__bidrakshakMobileNavigationDismissBound) {
    document.addEventListener("click", (event) => {
      const currentSidebar = document.querySelector(".sidebar.mobile-nav-open");
      if (currentSidebar && !currentSidebar.contains(event.target)) {
        const button = currentSidebar.querySelector("[data-mobile-nav-toggle]");
        currentSidebar.classList.remove("mobile-nav-open");
        button?.setAttribute("aria-expanded", "false");
        currentSidebar.querySelector(".nav-section").inert = window.matchMedia("(max-width: 820px)").matches;
        if (button) {
          const label = t("menu");
          button.setAttribute("aria-label", label);
          button.title = label;
        }
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const currentSidebar = document.querySelector(".sidebar.mobile-nav-open");
        const button = currentSidebar?.querySelector("[data-mobile-nav-toggle]");
        currentSidebar?.classList.remove("mobile-nav-open");
        button?.setAttribute("aria-expanded", "false");
        if (currentSidebar) {
          currentSidebar.querySelector(".nav-section").inert = window.matchMedia("(max-width: 820px)").matches;
        }
        if (button) {
          const label = t("menu");
          button.setAttribute("aria-label", label);
          button.title = label;
        }
      }
    });
    window.addEventListener("resize", () => {
      const currentSidebar = document.querySelector(".sidebar");
      const currentToggle = currentSidebar?.querySelector("[data-mobile-nav-toggle]");
      const currentNav = currentSidebar?.querySelector(".nav-section");
      if (currentToggle && currentNav) {
        currentNav.inert = window.matchMedia("(max-width: 820px)").matches &&
          currentToggle.getAttribute("aria-expanded") !== "true";
      }
    });
    window.__bidrakshakMobileNavigationDismissBound = true;
  }
}

function navigateTo(screen) {
  const state = getAppState();
  state.currentScreen = screen;
  persistState();
  renderApp();
}

function getUserInitials(name) {
  return String(name || "U").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function shortenText(text, maxLength = 28) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
