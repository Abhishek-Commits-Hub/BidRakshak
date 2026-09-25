function renderBidReviewPage() {
  const state = getAppState();
  const tender = getTenderById(state.selectedTenderId || DEFAULT_DATA.tenders[0].id);
  const step = Number(state.selectedBidReviewStep || 1);
  const titles = [
    t("tenderAndBidDocuments"),
    t("requirementExtraction"),
    t("evidenceCollection"),
    t("ruleBasedValidation"),
    t("discrepancyDetection"),
    t("officerReview")
  ];

  const currentView = step === 1 ? renderTenderDocumentsView(tender) :
    step === 2 ? renderRequirementsView(tender) :
    step === 3 ? renderEvidenceView(tender) :
    step === 4 ? renderValidationView(tender) :
    step === 5 ? renderDiscrepancyView(tender) :
    renderOfficerDecisionView(tender);

  return `
    <div class="page-section">
      <div class="section-header">
        <h3>${t("tenderDetail")}: ${tender.id}</h3>
      </div>
      <div class="progress-rail">
        ${titles.map((title, index) => `
          <button type="button" class="step-pill ${index + 1 === step ? "active" : ""} ${index + 1 < step ? "done" : ""}" data-review-step="${index + 1}">
            ${index + 1 < step ? "✓" : index + 1}${title}
          </button>
        `).join("")}
      </div>
      ${currentView}
    </div>
  `;
}

function renderTenderDocumentsView(tender) {
  return `
    <div class="two-column">
      <div class="content-panel">
        <h3 class="card-title">${t("tender")}</h3>
        <div class="doc-grid">
          <div class="document-card">
            <div class="doc-meta"><span>${t("tender")}</span><span>${tender.id}</span></div>
            <h4 class="doc-title">${tender.title}</h4>
            <p class="meta-text">${tender.department}</p>
            <p class="meta-text">${tender.dueDate}</p>
          </div>
          <div class="document-card">
            <div class="doc-meta"><span>${t("bidder")}</span><span>${tender.bidder}</span></div>
            <h4 class="doc-title">${tender.bidder}</h4>
            <p class="meta-text">${t("status")}: ${tender.status}</p>
            <p class="meta-text">${t("risk")}: ${tender.risk}</p>
          </div>
        </div>
        <div class="inline-actions" style="margin-top: 18px;">
          <button type="button" class="btn btn-primary" id="simulateUploadBtn">${t("uploadDocument")}</button>
          <input type="file" id="hiddenFileInput" class="hidden" />
        </div>
      </div>

      <div class="content-panel">
        <h3 class="card-title">${t("requiredDocuments")}</h3>
        <div class="document-list">
          ${tender.documents.map((doc) => `
            <div class="document-card">
              <div class="doc-meta">
                <span>${doc.type}</span>
                <span>${doc.uploadStatus}</span>
              </div>
              <h4 class="doc-title">${escapeHtml(doc.name)}</h4>
              <div class="status-row">
                <span class="badge ${doc.verificationStatus === "Matched" ? "verified" : doc.verificationStatus === "Partial" ? "needs-review" : "non-compliant"}">${doc.verificationStatus}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderRequirementsView(tender) {
  return `
    <div class="content-panel">
      <h3 class="card-title">${t("requirementExtraction")}</h3>
      <div class="requirement-list">
        ${tender.requirements.map((req) => `
          <div class="requirement-card">
            <div class="requirement-meta">
              <span>${req.id}</span>
              <span class="badge ${req.status === "Compliant" ? "verified" : req.status === "Needs Review" ? "needs-review" : "non-compliant"}">${req.status}</span>
            </div>
            <div class="requirement-title">${req.text}</div>
            <p class="meta-text"><strong>${t("category")}</strong>: ${req.category}</p>
            <p class="meta-text"><strong>${t("sourceDocument")}</strong>: ${req.source}</p>
            <div class="status-row">
              <span class="badge verified">${req.ai}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderEvidenceView(tender) {
  return `
    <div class="content-panel">
      <h3 class="card-title">${t("evidenceCollection")}</h3>
      <div class="evidence-grid">
        ${tender.evidenceChain.map((item) => `
          <div class="evidence-box">
            <div class="doc-meta"><span>${item.requirement}</span><span>${item.result}</span></div>
            <h4 class="doc-title">${t("evidence")}: ${escapeHtml(item.evidence)}</h4>
            <p class="meta-text"><strong>${t("extractedValue")}</strong>: ${item.finding}</p>
            <p class="meta-text"><strong>${t("sourceDocument")}</strong>: ${item.evidence}</p>
            <div class="status-row">
              <span class="badge verified">${t("evidenceFound")}</span>
              <span class="badge medium">${t("confidence")}: ${t("high")}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderValidationView(tender) {
  const rows = [
    {
      rule: "Minimum annual turnover ₹1,00,00,000",
      input: "Declared turnover ₹1,42,00,000",
      threshold: "₹1,00,00,000",
      result: t("verifiedText"),
      explanation: "Declared value exceeds required threshold as specified in tender clause."
    },
    {
      rule: "Government supply experience 5 years",
      input: "Submitted experience 3 years",
      threshold: "5 years",
      result: t("nonCompliant"),
      explanation: "Submitted supporting document does not satisfy the minimum service period requirement."
    },
    {
      rule: "Certificate requirement",
      input: "Certificate matching technical document not consistently present",
      threshold: "Yes",
      result: t("insufficientEvidence"),
      explanation: "Requirement is unclear from the uploaded evidence and should be reviewed manually."
    }
  ];

  return `
    <div class="content-panel">
      <h3 class="card-title">${t("ruleBasedValidation")}</h3>
      <div class="callout">
        <h4>${t("aiAssists")} ${t("rulesValidate")} ${t("evidenceSupports")} ${t("humanAuthorityDecides")}</h4>
        <p>${t("finalAuthority")} ${t("noActionAutomatic")}</p>
      </div>
      <table class="rule-table">
        <thead>
          <tr>
            <th>${t("businessRule")}</th>
            <th>${t("uploadedFile")}</th>
            <th>${t("threshold")}</th>
            <th>${t("result")}</th>
            <th>${t("explanation")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.rule}</td>
              <td>${row.input}</td>
              <td>${row.threshold}</td>
              <td><span class="badge ${row.result === t("verifiedText") ? "verified" : row.result === t("nonCompliant") ? "non-compliant" : "needs-review"}">${row.result}</span></td>
              <td>${row.explanation}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDiscrepancyView(tender) {
  return `
    <div class="content-panel">
      <h3 class="card-title">${t("discrepancyDetection")}</h3>
      <div class="discrepancy-list">
        ${tender.discrepancies.length ? tender.discrepancies.map((item) => `
          <div class="discrepancy-item">
            <div class="doc-meta"><span>Discrepancy</span><span class="badge ${item.severity === "High" ? "high" : item.severity === "Medium" ? "medium" : "low"}">${item.severity}</span></div>
            <h4 class="doc-title">${item.requirement}</h4>
            <p class="meta-text"><strong>${t("evidence")}</strong>: ${item.evidence}</p>
            <p class="meta-text"><strong>${t("explanation")}</strong>: ${item.explanation}</p>
            <div class="status-row">
              <span class="badge needs-review">${item.action}</span>
            </div>
          </div>
        `).join("") : `<div class="empty-state">${t("noData")}</div>`}
      </div>
    </div>
  `;
}

function renderOfficerDecisionView(tender) {
  const requirement = tender.requirements.find((item) => item.status === "Needs Review") || tender.requirements[0];
  return `
    <div class="content-panel">
      <h3 class="card-title">${t("officerReview")}</h3>
      <div class="decision-panel">
        <div>
          <div class="review-label">${t("requirement")}</div>
          <div class="review-body">
            <p>${requirement.text}</p>
          </div>
        </div>
        <div>
          <div class="review-label">${t("evidence")}</div>
          <div class="review-body">
            <p>${tender.documents[4].name}</p>
            <ul class="bullet-list">
              <li>${t("extractedValue")}: ₹1.42 crore</li>
              <li>${t("sourceDocument")}: ${tender.documents[4].name}</li>
              <li>${t("verification")}: ${t("evidenceFound")}</li>
            </ul>
          </div>
        </div>
        <div>
          <div class="review-label">${t("finding")}</div>
          <div class="review-body">
            <p>${t("systemResult")}: ${t("needsReview")}</p>
            <p style="margin-top: 8px;">${t("officerAction")}: ${t("needsAttentionLabel")}</p>
          </div>
        </div>
      </div>
      <div class="review-actions">
        <button type="button" class="btn btn-success" data-officer-action="confirm">${t("confirm")}</button>
        <button type="button" class="btn btn-warning" data-officer-action="override">${t("override")}</button>
        <button type="button" class="btn btn-secondary" data-officer-action="clarification">${t("requestClarification")}</button>
      </div>
    </div>
  `;
}

function bindBidReviewEvents() {
  document.querySelectorAll("[data-review-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = getAppState();
      state.selectedBidReviewStep = Number(button.dataset.reviewStep);
      persistState();
      renderApp();
    });
  });

  const uploadBtn = document.getElementById("simulateUploadBtn");
  const fileInput = document.getElementById("hiddenFileInput");
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const state = getAppState();
      state.uploadedDocuments = state.uploadedDocuments || {};
      state.uploadedDocuments[file.name] = { name: file.name, size: file.size, type: file.type || "application/pdf" };
      persistState();
      showToast(`${file.name} ${t("uploadedFile")}`);
      renderApp();
    });
  }

  document.querySelectorAll("[data-officer-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.officerAction;
      if (action === "confirm") {
        const state = getAppState();
        state.officerDecisions = state.officerDecisions || [];
        state.officerDecisions.push({ action: "Confirm", requirement: "REQ-004", timestamp: new Date().toISOString() });
        appendAuditLog("Officer Demo", "Requirement reviewed", "REQ-004", "Turnover Certificate.pdf", "Confirmed", "Verified against submitted declaration.");
        showToast("Decision confirmed");
        navigateTo("officer-dashboard");
      }

      if (action === "override") {
        openModal("overrideModal");
      }

      if (action === "clarification") {
        openModal("clarificationModal");
      }
    });
  });
}
