function renderBidderLayout(contentHtml, pageTitle) {
  const state = getAppState();
  const currentUser = state.currentUser || DEFAULT_DATA.users.bidder;
  const currentSection = state.currentScreen === "bidder-dashboard" ? t("overview") : pageTitle;
  const notifications = (state.notifications || DEFAULT_DATA.notifications)
    .filter((item) => item.type !== "success");

  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="breadcrumbs current-section-label">
            <span aria-current="page">${currentSection}</span>
          </div>
          <div class="page-header">
            <h1 class="page-title">${pageTitle}</h1>
          </div>
          <div class="topbar-actions">
            <div class="lang-switch">
              <button type="button" class="lang-btn ${getSelectedLanguage() === "en" ? "active" : ""}" data-lang="en">${t("englishShort")}</button>
              <button type="button" class="lang-btn ${getSelectedLanguage() === "hi" ? "active" : ""}" data-lang="hi">${t("hindiShort")}</button>
            </div>
            <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme">
              <svg class="theme-icon theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.5 6.5 0 0 0 8.268 8.268c.344-.215.825-.003.803.401"></path></svg>
              <svg class="theme-icon theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>
            </button>
            <div class="notification-menu">
              <button type="button" class="icon-button" data-notifications-toggle aria-expanded="false" aria-controls="notificationPopover" aria-label="${t("pendingNotifications")}" title="${t("pendingNotifications")}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"></path>
                  <path d="M10 21a2 2 0 0 0 4 0"></path>
                </svg>
                <span class="notification-badge">${notifications.length}</span>
              </button>
              ${renderNotificationPanel()}
            </div>
            <div class="user-profile">
              <div class="user-avatar">${getUserInitials(currentUser.name)}</div>
              <div>
                <div style="font-weight:700; font-size: 0.82rem;">${currentUser.name}</div>
                <div style="color: var(--slate-500); font-size: 0.72rem;">${t("bidder")}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <img class="brand-mark" src="assets/icons/bidrakshak-mark.svg" alt="" aria-hidden="true" />
            <div class="brand-lockup">
              <div class="brand-name">${t("appName")}</div>
              <div class="brand-sub">${t("appTagline")}</div>
            </div>
            <button type="button" class="mobile-menu-toggle" data-mobile-nav-toggle aria-expanded="false" aria-controls="bidderNavigation" aria-label="${t("menu")}" title="${t("menu")}">
              <svg class="hamburger-icon" viewBox="0 0 24 24" aria-hidden="true"><path class="bar-top" d="M4 6h16"></path><path class="bar-middle" d="M4 12h16"></path><path class="bar-bottom" d="M4 18h16"></path></svg>
            </button>
          </div>

          <nav class="nav-section" id="bidderNavigation">
            <ul class="nav-list">
              ${["bidder-dashboard","available-tenders","my-applications","compliance-checklist","settings"].map((screen) => `
                <li>
                  <button type="button" class="nav-item ${state.currentScreen === screen ? "active" : ""}" data-nav="${screen}">
                    ${renderBidderNavIcon(screen)}
                    ${renderBidderNavLabel(screen)}
                  </button>
                </li>
              `).join("")}
            </ul>
          </nav>
          <div class="sidebar-footer">
            <div class="sidebar-footer-title">${t("prototype")}</div>
            <p>${t("demoConnector")} · ${t("sandbox")}</p>
          </div>
        </aside>
        <main class="main-panel">${contentHtml}</main>
      </div>
    </div>
  `;
}

function renderBidderNavIcon(screen) {
  const icons = {
    "bidder-dashboard": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 12.5 12 4l9 8.5"></path><path d="M5 10.5V20h14v-9.5"></path></svg>',
    "available-tenders": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 4h10l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path><path d="M8 9h8M8 13h8"></path></svg>',
    "my-applications": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 6h16v12H4z"></path><path d="M8 10h8M8 14h8"></path></svg>',
    "compliance-checklist": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m8 12 2 2 4-4"></path><path d="M20 12A8 8 0 1 1 12 4a8 8 0 0 1 8 8Z"></path></svg>',
    "settings": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19.14 12.94a7.5 7.5 0 0 0 0-1.88l2.03-1.58-2-3.46-2.4.97a7.45 7.45 0 0 0-1.63-.94L14.78 3h-4l-.36 3.05a7.45 7.45 0 0 0-1.63.94l-2.4-.97-2 3.46 2.03 1.58a7.5 7.5 0 0 0 0 1.88l-2.03 1.58 2 3.46 2.4-.97c.5.39 1.04.7 1.63.94L10.78 21h4l.36-3.05c.59-.24 1.13-.55 1.63-.94l2.4.97 2-3.46-2.03-1.58z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
  };
  return icons[screen] || icons["bidder-dashboard"];
}

function renderBidderNavLabel(screen) {
  const labels = {
    "bidder-dashboard": t("overview"),
    "available-tenders": t("availableTenders"),
    "my-applications": t("myApplications"),
    "compliance-checklist": t("complianceChecklist"),
    "settings": t("settings")
  };
  return labels[screen] || t("overview");
}

function renderBidderDashboard() {
  const bid = DEFAULT_DATA.bids[0];
  const content = `
    <div class="page-section">
      <div class="hero-row">
        <div class="card hero-card">
          <div class="kicker teal">${t("demoPrototypeData")}</div>
          <h2>${t("welcomeBidder")}</h2>
          <p class="hero-sub">${t("aiAssists")} ${t("rulesValidate")} ${t("evidenceSupports")} ${t("humanAuthorityDecides")}</p>
          <div class="inline-actions">
            <button type="button" class="btn btn-primary" data-nav="available-tenders">${t("availableTenders")}</button>
            <button type="button" class="btn btn-secondary" data-nav="compliance-checklist">${t("complianceChecklist")}</button>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">${t("preSubmissionReadiness")}</h3>
          <div class="summary-grid">
            <div class="summary-box"><span class="label">Overall readiness</span><strong>82%</strong></div>
            <div class="summary-box"><span class="label">${t("requirementsCompleted")}</span><strong>14</strong></div>
            <div class="summary-box"><span class="label">${t("needsAttentionLabel")}</span><strong>2</strong></div>
            <div class="summary-box"><span class="label">${t("missing")}</span><strong>2</strong></div>
          </div>
        </div>
      </div>

      <div class="mini-grid">
        <div class="mini-stat"><div class="label">${t("activeApplications")}</div><div class="value">3</div><div class="stat-trend">+1</div></div>
        <div class="mini-stat"><div class="label">${t("documentsSubmitted")}</div><div class="value">12</div><div class="stat-trend">+3</div></div>
        <div class="mini-stat"><div class="label">${t("requirementsCompleted")}</div><div class="value">14</div><div class="stat-trend">82%</div></div>
        <div class="mini-stat"><div class="label">${t("clarificationsPending")}</div><div class="value">2</div><div class="stat-trend">Review</div></div>
      </div>

      <div class="dashboard-grid">
        <div class="content-panel">
          <div class="section-header">
            <h3>${t("mySubmissions")}</h3>
          </div>
          <div class="timeline">
            <div class="timeline-item done">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <strong>${t("bidSubmittedSuccessfully")}</strong>
                <span>BR-2026-00421</span>
              </div>
            </div>
            <div class="timeline-item pending">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <strong>${t("underVerification")}</strong>
                <span>${t("officerReviewStatus")}</span>
              </div>
            </div>
            <div class="timeline-item pending">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <strong>${t("finalStatus")}</strong>
                <span>${t("pending")}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="content-panel">
          <div class="section-header">
            <h3>${t("news")}</h3>
          </div>
          <div class="notification-list">
            <div class="notify-item">
              <div class="notify-dot success"></div>
              <div><strong>${t("documentAccepted")}</strong><div class="meta-text">GST certificate verified</div></div>
            </div>
            <div class="notify-item">
              <div class="notify-dot warning"></div>
              <div><strong>${t("clarificationRequest")}</strong><div class="meta-text">Experience certificate needs document confirmation</div></div>
            </div>
            <div class="notify-item">
              <div class="notify-dot"></div>
              <div><strong>${t("underVerification")}</strong><div class="meta-text">Bid moved to officer review queue</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderBidderLayout(content, t("dashboard"));
}

function renderAvailableTendersPage() {
  const tenders = DEFAULT_DATA.tenders;
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("availableTenders")}</h3>
      </div>
      <div class="tender-list">
        ${tenders.map((tender) => `
          <div class="tender-card-item">
            <div>
              <div class="meta-text">${tender.id}</div>
              <h4>${tender.title}</h4>
              <div class="meta-text">${tender.department}</div>
            </div>
            <div>
              <div class="meta-text">${t("deadline") || "Deadline"}</div>
              <strong>${tender.dueDate}</strong>
            </div>
            <div>
              <div class="meta-text">${t("bidsReceived")}</div>
              <strong>${tender.bidsReceived}</strong>
            </div>
            <div>
              <div class="meta-text">${t("status")}</div>
              <span class="badge verified">${t("available")}</span>
            </div>
            <button type="button" class="btn btn-primary" data-bidder-tender="${tender.id}">${t("openTender")}</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  return renderBidderLayout(content, t("availableTenders"));
}

function renderComplianceChecklist() {
  const checklist = [
    { label: "GST Certificate", status: "Complete" },
    { label: "PAN", status: "Complete" },
    { label: "Udyam Registration", status: "Complete" },
    { label: "Turnover Certificate", status: "Complete" },
    { label: "Experience Certificate", status: "Needs Attention" },
    { label: "Technical Compliance Document", status: "Missing" }
  ];

  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("complianceChecklist")}</h3>
      </div>
      <div class="checklist">
        ${checklist.map((item) => `
          <div class="check-item">
            <div class="left">
              <span class="check-icon ${item.status === "Complete" ? "complete" : item.status === "Needs Attention" ? "warning" : "missing"}">${item.status === "Complete" ? "✓" : item.status === "Needs Attention" ? "!" : "○"}</span>
              <strong>${item.label}</strong>
            </div>
            <span class="status-flag ${item.status === "Complete" ? "complete" : item.status === "Needs Attention" ? "warning" : "missing"}">${item.status}</span>
          </div>
        `).join("")}
      </div>
      <div class="inline-actions" style="margin-top: 18px;">
        <button type="button" class="btn btn-primary" id="runPrecheckBtn">${t("runPreCheck")}</button>
      </div>
    </div>
  `;

  return renderBidderLayout(content, t("complianceChecklist"));
}

function renderBidderView() {
  const state = getAppState();
  const screen = state.currentScreen;
  if (screen === "bidder-dashboard") return renderBidderDashboard();
  if (screen === "available-tenders") return renderAvailableTendersPage();
  if (screen === "my-applications") return renderMyApplicationsPage();
  if (screen === "compliance-checklist") return renderComplianceChecklist();
  if (screen === "settings") return renderBidderSettings();
  if (screen === "bidder-tender") return renderBidderTenderDetail();
  return renderBidderDashboard();
}

function renderMyApplicationsPage() {
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("myApplications")}</h3>
      </div>
      <div class="empty-state">
        <strong>${t("noActiveApplications")}</strong>
        <p>${t("browseTenders")}</p>
      </div>
    </div>
  `;
  return renderBidderLayout(content, t("myApplications"));
}

function renderBidderSettings() {
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("settings")}</h3>
      </div>
      <div class="content-panel">
        <div class="inline-actions">
          <button type="button" class="btn btn-danger" id="resetDemoDataBtn">${t("resetDemoData")}</button>
          <button type="button" class="btn btn-secondary" data-nav="bidder-dashboard">${t("dashboard")}</button>
        </div>
      </div>
    </div>
  `;
  return renderBidderLayout(content, t("settings"));
}

function renderBidderTenderDetail() {
  const state = getAppState();
  const tender = getTenderById(state.selectedTenderId || DEFAULT_DATA.tenders[0].id);
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${tender.title}</h3>
      </div>
      <div class="two-column">
        <div class="content-panel">
          <h3 class="card-title">${t("tender")}</h3>
          <p class="meta-text"><strong>${t("department") || "Department"}</strong>: ${tender.department}</p>
          <p class="meta-text"><strong>${t("deadline") || "Deadline"}</strong>: ${tender.dueDate}</p>
          <p class="meta-text"><strong>${t("requirement")}</strong>: ${tender.requirementSummary}</p>
          <div class="inline-actions">
            <button type="button" class="btn btn-primary" id="startApplicationBtn">${t("newBid")}</button>
            <button type="button" class="btn btn-secondary" data-nav="available-tenders">${t("availableTenders")}</button>
          </div>
        </div>
        <div class="content-panel">
          <h3 class="card-title">${t("documents")}</h3>
          <div class="document-list">
            ${tender.documents.map((doc) => `
              <div class="document-card">
                <div class="doc-meta"><span>${doc.type}</span><span>${doc.uploadStatus}</span></div>
                <h4 class="doc-title">${doc.name}</h4>
                <div class="status-row"><span class="badge verified">${doc.verificationStatus}</span></div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
  return renderBidderLayout(content, t("tenderDetail"));
}

function bindBidderEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.nav;
      if (target === "bidder-dashboard") navigateTo("bidder-dashboard");
      if (target === "available-tenders") navigateTo("available-tenders");
      if (target === "my-applications") navigateTo("my-applications");
      if (target === "compliance-checklist") navigateTo("compliance-checklist");
      if (target === "settings") navigateTo("settings");
    });
  });

  bindNotificationPopover();
  bindMobileNavigation();

  document.querySelectorAll("[data-bidder-tender]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = getAppState();
      state.selectedTenderId = button.dataset.bidderTender;
      state.currentScreen = "bidder-tender";
      persistState();
      renderApp();
    });
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => {
      switchLanguageWithAnimation(button.dataset.lang, renderApp);
    });
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = getSelectedTheme() === "dark" ? "light" : "dark";
      setSelectedTheme(nextTheme);
    });
  });

  const precheckBtn = document.getElementById("runPrecheckBtn");
  if (precheckBtn) {
    precheckBtn.addEventListener("click", () => {
      const state = getAppState();
      state.bidStatus = { tenderId: "GEM-DEMO-001", status: "Under Verification" };
      persistState();
      showToast("Pre-check completed: 82% ready");
      renderApp();
    });
  }

  const startBtn = document.getElementById("startApplicationBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const state = getAppState();
      const reference = "BR-2026-00421";
      state.selectedBidApplication = reference;
      state.currentScreen = "bidder-dashboard";
      state.bidStatus = { tenderId: state.selectedTenderId || "GEM-DEMO-001", status: "Submitted" };
      persistState();
      showToast(`Bid ${reference} submitted`);
      renderApp();
    });
  }

  const resetBtn = document.getElementById("resetDemoDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetDemoState();
      showToast("Demo data reset");
    });
  }
}
