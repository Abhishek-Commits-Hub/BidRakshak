function appendAuditLog(officer, action, requirement, evidence, decision, reason) {
  const state = getAppState();
  state.auditLogs = state.auditLogs || [];
  state.auditLogs.unshift({
    timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    officer,
    action,
    requirement,
    evidence,
    decision,
    reason
  });
  persistState();
}

function renderAuditTrailPage() {
  const state = getAppState();
  const auditLogs = state.auditLogs || DEFAULT_DATA.auditLogs;
  const content = `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("auditTrail")}</h3>
      </div>
      <div class="content-panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>${t("timestamp") || "Timestamp"}</th>
                <th>${t("officer")}</th>
                <th>${t("action")}</th>
                <th>${t("requirement")}</th>
                <th>${t("evidence")}</th>
                <th>${t("decision") || t("result")}</th>
                <th>${t("reason") || "Reason"}</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.map((log) => `
                <tr>
                  <td>${log.timestamp}</td>
                  <td>${log.officer}</td>
                  <td>${log.action}</td>
                  <td>${log.requirement}</td>
                  <td>${log.evidence}</td>
                  <td>${log.decision}</td>
                  <td>${log.reason}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return renderOfficerLayout(content, t("auditTrail"), "Audit Trail");
}

function renderNotificationPanel() {
  const notifications = (getAppState().notifications || DEFAULT_DATA.notifications)
    .filter((item) => item.type !== "success");
  return `
    <section class="notification-popover" id="notificationPopover" aria-label="${t("pendingNotifications")}">
      <div class="notification-popover-header">
        <div>
          <h2>${t("pendingNotifications")}</h2>
          <span>${notifications.length} ${t("pending").toLowerCase()}</span>
        </div>
        <button type="button" class="notification-close" data-notifications-close aria-label="${t("close")}" title="${t("close")}">×</button>
      </div>
      <div class="notification-list">
        ${notifications.map((item) => `
          <div class="notify-item">
            <div class="notify-dot ${item.type}"></div>
            <div>
              <strong>${item.title}</strong>
              <div class="meta-text">${item.detail}</div>
              <div class="meta-text">${item.time}</div>
            </div>
          </div>
        `).join("")}
        ${notifications.length ? "" : `<p class="notification-empty">${t("noPendingNotifications")}</p>`}
      </div>
    </section>
  `;
}

function initAuditModal() {
  const modalHtml = `
    <div id="overrideModal" class="modal-backdrop" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="overrideTitle">
        <div class="modal-header">
          <h3 id="overrideTitle">${t("override")}</h3>
          <button type="button" class="close-btn" data-close-modal="overrideModal">×</button>
        </div>
        <div class="modal-body">
          <label class="form-label" for="overrideReason">${t("reasonForOverride")}</label>
          <textarea id="overrideReason" placeholder="${t("reasonForOverride")}"></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-modal="overrideModal">${t("cancel")}</button>
          <button type="button" class="btn btn-warning" id="saveOverrideBtn">${t("override")}</button>
        </div>
      </div>
    </div>

    <div id="clarificationModal" class="modal-backdrop" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="clarificationTitle">
        <div class="modal-header">
          <h3 id="clarificationTitle">${t("clarificationRequest")}</h3>
          <button type="button" class="close-btn" data-close-modal="clarificationModal">×</button>
        </div>
        <div class="modal-body">
          <label class="form-label" for="clarificationText">${t("clarificationRequest")}</label>
          <textarea id="clarificationText" placeholder="${t("clarificationRequest")}"></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-modal="clarificationModal">${t("cancel")}</button>
          <button type="button" class="btn btn-primary" id="saveClarificationBtn">${t("requestClarification")}</button>
        </div>
      </div>
    </div>
  `;

  const app = document.getElementById("app");
  if (!document.getElementById("overrideModal")) {
    app.insertAdjacentHTML("beforeend", modalHtml);
  }

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.closeModal));
  });

  const saveOverride = document.getElementById("saveOverrideBtn");
  if (saveOverride) {
    saveOverride.addEventListener("click", () => {
      const reason = document.getElementById("overrideReason").value.trim() || "Manual override";
      appendAuditLog("Officer Demo", "Finding overridden", "REQ-004", "Experience Certificate.pdf", "Override", reason);
      closeModal("overrideModal");
      navigateTo("officer-dashboard");
      showToast("Override saved to audit trail");
    });
  }

  const saveClarification = document.getElementById("saveClarificationBtn");
  if (saveClarification) {
    saveClarification.addEventListener("click", () => {
      const reason = document.getElementById("clarificationText").value.trim() || "Clarification requested";
      appendAuditLog("Officer Demo", "Clarification requested", "REQ-004", "Experience Certificate.pdf", "Pending", reason);
      closeModal("clarificationModal");
      navigateTo("officer-dashboard");
      showToast("Clarification request saved");
    });
  }
}
