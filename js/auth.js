function renderLoginPage() {
  const app = document.getElementById("app");
  const state = getAppState();
  const selectedRole = state.selectedRole || "officer";
  const lang = getSelectedLanguage();
  const showPassword = state.showPassword || false;

  app.innerHTML = `
    <div class="login-page">
      <div class="login-shell">
        <div class="login-brand">
          <div class="login-brand-inner">
            <div class="brand-top">
              <img class="brand-mark" src="assets/icons/bidrakshak-mark.svg" alt="" aria-hidden="true" />
              <div class="brand-lockup">
                <div class="brand-name">${t("appName")}</div>
                <div class="brand-sub">${t("appTagline")}</div>
              </div>
            </div>

            <h1>${t("appName")}</h1>
            <p>${t("aiAssists")} ${t("rulesValidate")} ${t("evidenceSupports")} ${t("humanAuthorityDecides")}</p>

            <ul class="workflow-list">
              <li class="workflow-item"><span class="workflow-step">1</span><span>${t("tender")}</span></li>
              <div class="workflow-connector"></div>
              <li class="workflow-item"><span class="workflow-step">2</span><span>${t("requirementExtraction")}</span></li>
              <div class="workflow-connector"></div>
              <li class="workflow-item"><span class="workflow-step">3</span><span>${t("evidenceCollection")}</span></li>
              <div class="workflow-connector"></div>
              <li class="workflow-item"><span class="workflow-step">4</span><span>${t("verification")}</span></li>
              <div class="workflow-connector"></div>
              <li class="workflow-item"><span class="workflow-step">5</span><span>${t("officerReview")}</span></li>
            </ul>
          </div>
        </div>

        <div class="login-panel">
          <div class="login-card">
            <div class="role-toggle">
              <button type="button" class="role-option ${selectedRole === "officer" ? "active" : ""}" data-role="officer">
                <strong>${t("procurementOfficer")}</strong>
                <span>${t("procurementOfficerDesc")}</span>
              </button>
              <button type="button" class="role-option ${selectedRole === "bidder" ? "active" : ""}" data-role="bidder">
                <strong>${t("bidder")}</strong>
                <span>${t("bidderDesc")}</span>
              </button>
            </div>

            <form id="loginForm">
              <div class="form-group">
                <label class="form-label" for="email">${t("email")}</label>
                <div class="input-wrap">
                  <input id="email" type="email" value="${selectedRole === "officer" ? DEFAULT_DATA.users.officer.email : DEFAULT_DATA.users.bidder.email}" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="password">${t("password")}</label>
                <div class="input-wrap">
                  <input id="password" class="password-control" type="${showPassword ? "text" : "password"}" value="${selectedRole === "officer" ? DEFAULT_DATA.users.officer.password : DEFAULT_DATA.users.bidder.password}" required />
                  <button type="button" class="password-toggle" id="togglePassword">${showPassword ? t("hide") : t("show")}</button>
                </div>
              </div>

              <div class="inline-button-row">
                <button type="button" class="demo-button" id="demoLoginBtn">${t("useDemoAccount")}</button>
                <div class="lang-switch">
                  <button type="button" class="lang-btn ${lang === "en" ? "active" : ""}" data-lang="en">English</button>
                  <button type="button" class="lang-btn ${lang === "hi" ? "active" : ""}" data-lang="hi">हिंदी</button>
                </div>
                <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme">
                  <svg class="theme-icon theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.5 6.5 0 0 0 8.268 8.268c.344-.215.825-.003.803.401"></path></svg>
                  <svg class="theme-icon theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>
                </button>
              </div>

              <button type="submit" class="btn btn-primary">${t("login")}</button>
              <div class="form-error" id="loginError"></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  attachLoginEvents();
}

function attachLoginEvents() {
  document.querySelectorAll(".role-option").forEach((option) => {
    option.addEventListener("click", () => {
      const role = option.dataset.role;
      const state = getAppState();
      state.selectedRole = role;
      persistState();
      renderLoginPage();
    });
  });

  document.getElementById("togglePassword")?.addEventListener("click", () => {
    const state = getAppState();
    state.showPassword = !state.showPassword;
    persistState();
    renderLoginPage();
  });

  document.getElementById("demoLoginBtn")?.addEventListener("click", () => {
    const state = getAppState();
    const role = state.selectedRole || "officer";
    const user = DEFAULT_DATA.users[role];
    state.currentUser = { ...user };
    state.currentScreen = role === "officer" ? "officer-dashboard" : "bidder-dashboard";
    persistState();
    renderApp();
  });

  document.getElementById("loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const state = getAppState();
    const role = state.selectedRole || "officer";
    const user = DEFAULT_DATA.users[role];
    const errorEl = document.getElementById("loginError");

    if (email === user.email && password === user.password) {
      state.currentUser = { ...user };
      state.currentScreen = role === "officer" ? "officer-dashboard" : "bidder-dashboard";
      persistState();
      renderApp();
      return;
    }

    errorEl.textContent = "Invalid credentials. Please use the demo account or check your role.";
    errorEl.classList.add("show");
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchLanguageWithAnimation(btn.dataset.lang, renderLoginPage);
    });
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextTheme = getSelectedTheme() === "dark" ? "light" : "dark";
      setSelectedTheme(nextTheme);
    });
  });
}

function logoutUser() {
  const state = getAppState();
  state.currentUser = null;
  state.currentScreen = "login";
  persistState();
  renderApp();
}
