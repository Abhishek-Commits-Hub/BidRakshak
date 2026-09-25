function applyTheme() {
  const state = getAppState();
  const theme = state.selectedTheme || "light";
  document.body.dataset.theme = theme;
  document.documentElement.dataset.theme = theme;
}

function renderApp() {
  const state = getAppState();
  document.documentElement.lang = getSelectedLanguage();
  applyTheme();

  const app = document.getElementById("app");
  if (!state.currentUser) {
    renderLoginPage();
    return;
  }

  if (state.currentUser.role === "officer") {
    const screen = state.currentScreen || "officer-dashboard";
    const officerMap = {
      "officer-dashboard": () => renderOfficerDashboard(),
      "officer-tenders": () => renderOfficerTendersPage(),
      "verification-queue": () => renderVerificationQueuePage(),
      "officer-tender": () => renderTenderWorkflowPage(),
      "audit-trail": () => renderAuditTrailPage(),
      "reports": () => renderOfficerReportsPage(),
      "settings": () => renderOfficerSettings(),
      "login": () => renderLoginPage()
    };

    app.innerHTML = officerMap[screen]?.() || renderOfficerDashboard();
    bindOfficerEvents();
    bindBidReviewEvents();
    initAuditModal();
    return;
  }

  const bidderMap = {
    "bidder-dashboard": () => renderBidderDashboard(),
    "available-tenders": () => renderAvailableTendersPage(),
    "my-applications": () => renderMyApplicationsPage(),
    "compliance-checklist": () => renderComplianceChecklist(),
    "settings": () => renderBidderSettings(),
    "bidder-tender": () => renderBidderTenderDetail(),
    "login": () => renderLoginPage()
  };

  app.innerHTML = bidderMap[state.currentScreen || "bidder-dashboard"]?.() || renderBidderDashboard();
  bindBidderEvents();
}

document.addEventListener("DOMContentLoaded", () => {
  renderApp();
});

window.addEventListener("beforeunload", () => {
  persistState();
});
