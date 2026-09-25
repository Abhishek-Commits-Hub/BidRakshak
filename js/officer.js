function renderOfficerLayout(contentHtml, pageTitle, breadcrumb) {
  const state = getAppState();
  const currentUser = state.currentUser || DEFAULT_DATA.users.officer;
  const currentSection = state.currentScreen === "officer-dashboard" ? t("overview") : pageTitle;
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
                <div style="color: var(--slate-500); font-size: 0.72rem;">${t("officer")}</div>
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
            <button type="button" class="mobile-menu-toggle" data-mobile-nav-toggle aria-expanded="false" aria-controls="officerNavigation" aria-label="${t("menu")}" title="${t("menu")}">
              <svg class="hamburger-icon" viewBox="0 0 24 24" aria-hidden="true"><path class="bar-top" d="M4 6h16"></path><path class="bar-middle" d="M4 12h16"></path><path class="bar-bottom" d="M4 18h16"></path></svg>
            </button>
          </div>

          <nav class="nav-section" id="officerNavigation">
            <ul class="nav-list">
              ${["officer-dashboard","officer-tenders","verification-queue","audit-trail","reports","settings"].map((screen) => `
                <li>
                  <button type="button" class="nav-item ${state.currentScreen === screen ? "active" : ""}" data-nav="${screen}">
                    ${renderNavIcon(screen)}
                    ${renderNavLabel(screen)}
                  </button>
                </li>
              `).join("")}
            </ul>
          </nav>

          <div class="sidebar-footer">
            <div class="sidebar-footer-title">${t("prototype")}</div>
            <p>${t("sampleDocs")}</p>
          </div>
        </aside>

        <main class="main-panel">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

function renderNavIcon(screen) {
  const icons = {
    "officer-dashboard": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 12.5 12 4l9 8.5"></path><path d="M5 10.5V20h14v-9.5"></path></svg>',
    "officer-tenders": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M7 4h10l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path><path d="M8 9h8M8 13h8"></path></svg>',
    "verification-queue": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10"></path><path d="M8 20h8"></path><path d="M10 11h4"></path></svg>',
    "audit-trail": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 12h4l2-6 4 12 2-6h2"></path></svg>',
    "reports": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 20V9"></path><path d="M12 20V4"></path><path d="M18 20v-8"></path></svg>',
    "settings": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19.14 12.94a7.5 7.5 0 0 0 0-1.88l2.03-1.58-2-3.46-2.4.97a7.45 7.45 0 0 0-1.63-.94L14.78 3h-4l-.36 3.05a7.45 7.45 0 0 0-1.63.94l-2.4-.97-2 3.46 2.03 1.58a7.5 7.5 0 0 0 0 1.88l-2.03 1.58 2 3.46 2.4-.97c.5.39 1.04.7 1.63.94L10.78 21h4l.36-3.05c.59-.24 1.13-.55 1.63-.94l2.4.97 2-3.46-2.03-1.58z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
  };
  return icons[screen] || icons["officer-dashboard"];
}

function renderNavLabel(screen) {
  const labels = {
    "officer-dashboard": t("overview"),
    "officer-tenders": t("tenders"),
    "verification-queue": t("verificationQueue"),
    "audit-trail": t("auditTrail"),
    "reports": t("reports"),
    "settings": t("settings")
  };
  return labels[screen] || t("overview");
}

function renderOfficerDashboard() {
  const state = getAppState();
  const notifications = state.notifications || DEFAULT_DATA.notifications;
  const summary = [
    { label: t("activeTenders"), value: 24, trend: "+4%" },
    { label: t("bidsReceived"), value: 184, trend: "+12%" },
    { label: t("pendingReviews"), value: 27, trend: "-3" },
    { label: t("needsAttention"), value: 8, trend: "2 urgent" }
  ];

  const queueItems = [
    { id: "GEM-DEMO-001", title: "Supply of Computer Equipment", status: t("needsReview"), risk: t("medium"), evidence: "18/21 verified", action: t("review") },
    { id: "GEM-DEMO-002", title: "Office Networking Equipment", status: t("verifiedText"), risk: t("low"), evidence: "24/24 verified", action: t("review") },
    { id: "GEM-DEMO-003", title: "Office Furniture Supply", status: t("pending"), risk: t("medium"), evidence: "12/18 verified", action: t("review") }
  ];

  const activity = DEFAULT_DATA.activity;

  const content = `
    <div class="page-section">
      <div class="hero-row">
        <div class="card hero-card">
          <div class="kicker blue">${t("demoPrototypeData")}</div>
          <h2>${t("goodMorningOfficer")}</h2>
          <p class="hero-sub">${t("todaysVerificationOverview")}. ${t("touchCopy")}</p>
          <div class="inline-actions">
            <button type="button" class="btn btn-primary" data-nav="verification-queue">${t("verificationQueue")}</button>
            <button type="button" class="btn btn-secondary" data-nav="officer-tenders">${t("tenders")}</button>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">${t("attentionPanel")}</h3>
          <div class="summary-grid">
            <div class="summary-box"><span class="label">${t("needsAttention")}</span><strong>3</strong></div>
            <div class="summary-box"><span class="label">${t("needsReview")}</span><strong>8</strong></div>
            <div class="summary-box"><span class="label">${t("pending")}</span><strong>12</strong></div>
            <div class="summary-box"><span class="label">${t("verifiedText")}</span><strong>19</strong></div>
          </div>
        </div>
      </div>

      <div class="mini-grid">
        ${summary.map((item) => `
          <div class="mini-stat">
            <div class="label">${item.label}</div>
            <div class="value">${item.value}</div>
            <div class="stat-trend">${item.trend}</div>
          </div>
        `).join("")}
      </div>

      <div class="dashboard-grid">
        <div class="content-panel">
          <div class="section-header">
            <h3>${t("verificationQueueTitle")}</h3>
            <button type="button" class="link-button" data-nav="verification-queue">${t("viewAll") || t("openTender")}</button>
          </div>
          <div class="queue-list">
            ${queueItems.map((item) => `
              <div class="queue-item">
                <div>
                  <div class="queue-title">${item.id}</div>
                  <div class="meta-text">${item.title}</div>
                </div>
                <span class="badge ${item.status === t("needsReview") ? "needs-review" : item.status === t("verifiedText") ? "verified" : "needs-review"}">${item.status}</span>
                <span class="badge ${item.risk === t("medium") ? "medium" : item.risk === t("low") ? "low" : "high"}">${item.risk}</span>
                <div class="meta-text">${item.evidence}</div>
                <div class="row-actions">
                  <button type="button" class="btn btn-secondary" data-nav="verification-queue">${item.action}</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="content-panel">
          <div class="section-header">
            <h3>${t("recentActivity")}</h3>
          </div>
          <div class="activity-list">
            ${activity.map((item) => `
              <div class="activity-item">
                <div class="activity-icon ${item.icon === "detect" ? "warning" : item.icon === "review" ? "error" : ""}">${item.icon === "extract" ? "✓" : item.icon === "verify" ? "✓" : item.icon === "detect" ? "!" : "⏱"}</div>
                <div class="activity-text">
                  <strong>${item.label}</strong>
                  <span class="meta-text">${item.time}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="dashboard-grid" style="margin-top: 22px;">
        <div class="content-panel">
          <div class="section-header">
            <h3>${t("complianceOverview")}</h3>
          </div>
          <div class="summary-grid">
            <div class="summary-box"><span class="label">${t("verifiedText")}</span><strong>64%</strong></div>
            <div class="summary-box"><span class="label">${t("needsReview")}</span><strong>22%</strong></div>
            <div class="summary-box"><span class="label">${t("nonCompliant")}</span><strong>8%</strong></div>
            <div class="summary-box"><span class="label">${t("insufficientEvidence")}</span><strong>6%</strong></div>
          </div>
        </div>

        <div class="notification-panel">
          <div class="section-header">
            <h3>${t("news")}</h3>
          </div>
          <div class="notification-list">
            ${notifications.slice(0, 3).map((item) => `
              <div class="notify-item">
                <div class="notify-dot ${item.type === "success" ? "success" : item.type === "warning" ? "warning" : ""}"></div>
                <div>
                  <strong>${item.title}</strong>
                  <div class="meta-text">${item.detail}</div>
                  <div class="meta-text">${item.time}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  return renderOfficerLayout(content, t("overview"), t("overview"));
}

function renderOfficerTendersPage() {
  const tenders = DEFAULT_DATA.tenders;
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("tenders")}</h3>
      </div>
      <div class="filter-bar">
        <div class="input-wrap">
          <input placeholder="${t("search")}" id="tenderSearch" />
        </div>
        <div class="input-wrap">
          <select id="statusFilter">
            <option value="all">${t("all")}</option>
            <option value="Verification in progress">${t("pending")}</option>
            <option value="Verified">${t("verifiedText")}</option>
          </select>
        </div>
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
              <span class="badge ${tender.status === "Verified" ? "verified" : "needs-review"}">${tender.status}</span>
            </div>
            <button type="button" class="btn btn-secondary" data-open-tender="${tender.id}">${t("openTender")}</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  return renderOfficerLayout(content, t("tenders"), "Tenders");
}

function renderVerificationQueuePage() {
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("verificationQueueTitle")}</h3>
      </div>
      <div class="queue-list">
        <div class="queue-item">
          <div>
            <div class="queue-title">GEM-DEMO-001</div>
            <div class="meta-text">Supply of Computer Equipment</div>
          </div>
          <span class="badge needs-review">${t("needsReview")}</span>
          <span class="badge medium">${t("medium")}</span>
          <div class="meta-text">18/21 verified</div>
          <button class="btn btn-secondary" type="button" data-open-tender="GEM-DEMO-001">${t("review")}</button>
        </div>
        <div class="queue-item">
          <div>
            <div class="queue-title">GEM-DEMO-003</div>
            <div class="meta-text">Office Furniture Supply</div>
          </div>
          <span class="badge needs-review">${t("pending")}</span>
          <span class="badge medium">${t("medium")}</span>
          <div class="meta-text">12/18 verified</div>
          <button class="btn btn-secondary" type="button" data-open-tender="GEM-DEMO-003">${t("review")}</button>
        </div>
      </div>
    </div>
  `;

  return renderOfficerLayout(content, t("verificationQueue"), "Verification Queue");
}

function renderOfficerReportsPage() {
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("reports")}</h3>
      </div>
      <div class="content-panel">
        <h3 class="card-title">${t("auditSummary")}</h3>
        <table>
          <tr><th>${t("tender")}</th><td>GEM-DEMO-001</td></tr>
          <tr><th>${t("bidder")}</th><td>M/S Alpha Tech Systems</td></tr>
          <tr><th>${t("requirement")}</th><td>5 years of experience minimum</td></tr>
          <tr><th>${t("evidence")}</th><td>Experience Certificate.pdf</td></tr>
          <tr><th>${t("decision") || t("result")}</th><td>${t("needsReview")}</td></tr>
        </table>
        <div class="review-actions">
          <button type="button" class="btn btn-primary" id="printReportBtn">${t("printReport")}</button>
          <button type="button" class="btn btn-secondary" id="downloadReportBtn">${t("downloadReport")}</button>
        </div>
      </div>
    </div>
  `;

  return renderOfficerLayout(content, t("reports"), "Reports");
}

function renderOfficerSettings() {
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("settings")}</h3>
      </div>
      <div class="content-panel">
        <div class="inline-actions">
          <button type="button" class="btn btn-danger" id="resetDemoDataBtn">${t("resetDemoData")}</button>
          <button type="button" class="btn btn-secondary" data-nav="officer-dashboard">${t("dashboard")}</button>
        </div>
      </div>
    </div>
  `;

  return renderOfficerLayout(content, t("settings"), "Settings");
}

function renderOfficerView() {
  const state = getAppState();
  const screen = state.currentScreen;

  if (screen === "officer-dashboard") return renderOfficerDashboard();
  if (screen === "officer-tenders") return renderOfficerTendersPage();
  if (screen === "verification-queue") return renderVerificationQueuePage();
  if (screen === "officer-tender") return renderTenderWorkflowPage();
  if (screen === "audit-trail") return renderAuditTrailPage();
  if (screen === "reports") return renderOfficerReportsPage();
  if (screen === "settings") return renderOfficerSettings();
  return renderOfficerDashboard();
}

function renderTenderWorkflowPage() {
  const state = getAppState();
  const tender = getTenderById(state.selectedTenderId || DEFAULT_DATA.tenders[0].id);
  const workflow = renderBidReviewPage();
  return renderOfficerLayout(workflow, `${t("tenderDetail")} - ${tender.id}`, tender.id);
}

function bindOfficerEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.nav;
      if (target === "officer-dashboard") navigateTo("officer-dashboard");
      if (target === "officer-tenders") navigateTo("officer-tenders");
      if (target === "verification-queue") navigateTo("verification-queue");
      if (target === "audit-trail") navigateTo("audit-trail");
      if (target === "reports") navigateTo("reports");
      if (target === "settings") navigateTo("settings");
    });
  });

  bindNotificationPopover();
  bindMobileNavigation();

  document.querySelectorAll("[data-open-tender]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = getAppState();
      state.selectedTenderId = button.dataset.openTender;
      state.currentScreen = "officer-tender";
      state.selectedBidReviewStep = 1;
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

  const printBtn = document.getElementById("printReportBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());

  const downloadBtn = document.getElementById("downloadReportBtn");
  if (downloadBtn) downloadBtn.addEventListener("click", () => {
    const report = "BidRakshak demo verification report\nTender: GEM-DEMO-001\nBidder: M/S Alpha Tech Systems\nStatus: Needs Review";
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bidrakshak-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report downloaded");
  });

  const resetBtn = document.getElementById("resetDemoDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetDemoState();
      showToast("Demo data reset");
    });
  }
}
