const DEFAULT_DATA = {
  users: {
    officer: {
      id: "officer-demo",
      email: "officer@bidrakshak.gov.in",
      password: "Officer@123",
      name: "Procurement Officer",
      role: "officer"
    },
    bidder: {
      id: "bidder-demo",
      email: "bidder@demo.in",
      password: "Bidder@123",
      name: "Bidder Demo",
      role: "bidder"
    }
  },
  tenders: [
    {
      id: "GEM-DEMO-001",
      title: "Supply of Computer Equipment",
      department: "Government Department",
      deadline: "2026-09-30",
      bidsReceived: 12,
      status: "Verification in progress",
      risk: "Medium",
      category: "IT Procurement",
      dueDate: "30 September 2026",
      bidder: "M/S Alpha Tech Systems",
      requirementSummary: "Minimum turnover, GST, Udyam, prior supply experience and technical compliance required.",
      documents: [
        { name: "Technical Bid.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "Financial Bid.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "GST Certificate.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "Udyam Registration.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "Experience Certificate.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Partial" },
        { name: "Turnover Certificate.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" }
      ],
      requirements: [
        { id: "REQ-001", text: "Bidder must have minimum annual turnover of ₹1 crore.", category: "Financial", source: "Tender Annexure A", status: "Compliant", ai: "AI Extracted" },
        { id: "REQ-002", text: "Valid GST registration is mandatory.", category: "Statutory", source: "Tender Clause 3.2", status: "Compliant", ai: "AI Extracted" },
        { id: "REQ-003", text: "Valid Udyam registration certificate must be attached.", category: "Eligibility", source: "Tender Clause 1.4", status: "Compliant", ai: "AI Extracted" },
        { id: "REQ-004", text: "Bidder must have at least 5 years of government supply experience.", category: "Technical", source: "Tender Clause 5.1", status: "Needs Review", ai: "AI Extracted" },
        { id: "REQ-005", text: "Bid security declaration must be submitted.", category: "Commercial", source: "Tender Clause 6.2", status: "Compliant", ai: "AI Extracted" }
      ],
      evidenceChain: [
        { requirement: "REQ-001", evidence: "Turnover Certificate.pdf", finding: "₹1.42 crore declared", result: "Compliant" },
        { requirement: "REQ-004", evidence: "Experience Certificate.pdf", finding: "3 years of supply experience claimed", result: "Non-compliant" }
      ],
      discrepancies: [
        { id: "D-001", severity: "High", requirement: "Government supply experience requirement", evidence: "Experience Certificate.pdf", explanation: "The supporting document indicates 3 years of experience against the required 5 years.", action: "Requires officer review" },
        { id: "D-002", severity: "Medium", requirement: "Certificate validity date check", evidence: "GST Certificate.pdf", explanation: "Validity date could not be conclusively verified from the uploaded scan metadata.", action: "Request clarification" }
      ]
    },
    {
      id: "GEM-DEMO-002",
      title: "Office Networking Equipment",
      department: "IT Infrastructure Cell",
      deadline: "2026-10-05",
      bidsReceived: 9,
      status: "Verified",
      risk: "Low",
      category: "Networking",
      dueDate: "05 October 2026",
      bidder: "Riviera Digital Systems",
      requirementSummary: "Supply and installation with SLA terms, certification and OEM compliance requirements.",
      documents: [
        { name: "Technical Compliance.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "OEM Authorization.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "Installation Plan.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" },
        { name: "GST Certificate.pdf", type: "PDF", uploadStatus: "Verified", verificationStatus: "Matched" }
      ],
      requirements: [
        { id: "REQ-101", text: "Bidder must submit OEM authorization certificate.", category: "Eligibility", source: "Tender Clause 2.5", status: "Compliant", ai: "AI Extracted" },
        { id: "REQ-102", text: "Technical compliance document must match tender specifications.", category: "Technical", source: "Annexure D", status: "Compliant", ai: "AI Extracted" },
        { id: "REQ-103", text: "Support SLA must be at least 3 years.", category: "Commercial", source: "Clause 4.6", status: "Compliant", ai: "AI Extracted" }
      ],
      evidenceChain: [
        { requirement: "REQ-101", evidence: "OEM Authorization.pdf", finding: "Authorized distributor certificate present", result: "Compliant" },
        { requirement: "REQ-102", evidence: "Technical Compliance.pdf", finding: "All required features mapped to specification table", result: "Compliant" }
      ],
      discrepancies: []
    }
  ],
  bids: [
    {
      id: "BR-2026-00421",
      tenderId: "GEM-DEMO-001",
      bidderName: "M/S Alpha Tech Systems",
      status: "Submitted",
      reference: "BR-2026-00421",
      readiness: 82,
      requirementsChecked: 18,
      satisfied: 14,
      needsAttention: 2,
      missingEvidence: 2,
      documents: [
        { name: "GST Certificate", status: "Complete" },
        { name: "PAN", status: "Complete" },
        { name: "Udyam Registration", status: "Complete" },
        { name: "Turnover Certificate", status: "Complete" },
        { name: "Experience Certificate", status: "Needs Attention" },
        { name: "Technical Compliance Document", status: "Missing" }
      ]
    }
  ],
  officerDecisions: [],
  auditLogs: [
    {
      timestamp: "2026-09-25 14:32",
      officer: "Officer Demo",
      action: "Requirement reviewed",
      requirement: "REQ-004",
      evidence: "Turnover Certificate.pdf",
      decision: "Confirmed",
      reason: "Verified against submitted turnover declaration."
    },
    {
      timestamp: "2026-09-25 14:41",
      officer: "Officer Demo",
      action: "Finding overridden",
      requirement: "REQ-007",
      evidence: "Technical Certificate.pdf",
      decision: "Override",
      reason: "Certificate verified manually with supporting annexure."
    }
  ],
  notifications: [
    {
      id: 1,
      type: "warning",
      title: "3 bids require review",
      detail: "Officer attention is required for urgent compliance checks.",
      time: "10 min ago"
    },
    {
      id: 2,
      type: "alert",
      title: "1 discrepancy detected",
      detail: "Experience requirement needs manual confirmation.",
      time: "25 min ago"
    },
    {
      id: 3,
      type: "success",
      title: "Document accepted",
      detail: "GST certificate uploaded and validated by simulator.",
      time: "1 hr ago"
    }
  ],
  activity: [
    { icon: "extract", label: "Requirement extracted", time: "08:30" },
    { icon: "verify", label: "Document verified", time: "09:40" },
    { icon: "detect", label: "Discrepancy detected", time: "11:20" },
    { icon: "review", label: "Officer review completed", time: "14:17" }
  ],
  appState: {
    currentUser: null,
    selectedLanguage: "en",
    selectedTheme: "light",
    selectedRole: "officer",
    currentScreen: "login",
    selectedTenderId: "GEM-DEMO-001",
    selectedBidReviewStep: 1,
    selectedBidderTenderId: "GEM-DEMO-001",
    selectedBidApplication: "BR-2026-00421",
    uploadedDocuments: {},
    bidStatus: { tenderId: "GEM-DEMO-001", status: "Under Verification" }
  }
};

const DEFAULT_STATE = JSON.parse(JSON.stringify(DEFAULT_DATA.appState));
