import type {
    AnalysisStatus,
    AuditLog,
    Evidence,
    ReportSummary,
    Requirement,
    RequirementDetail,
    ReviewDecision,
    RiskSummary,
    TenderDetail,
    VerificationResult,
    User,
} from "../types/index";

const now = "2026-09-14T09:30:00Z";

export const demoUser: User = {
    id: 1,
    email: "demo@bidrakshak.gov.in",
    full_name: "Demo Procurement Officer",
    is_active: true,
    created_at: "2026-01-15T09:00:00Z",
};

export const demoTender: TenderDetail = {
    id: 1,
    tender_number: "GEM-DEMO-001",
    title: "Supply and Installation of Smart Classroom Equipment",
    organization: "Department of School Education",
    description: "Demonstration tender for classroom technology procurement.",
    status: "OPEN",
    department: "School Education",
    tender_id_display: "EDU/SMART/2026/001",
    tender_type: "Open Tender",
    bid_type: "Two Cover",
    estimated_value: 12500000,
    emd_amount: 250000,
    bid_validity_days: 180,
    delivery_period_days: 90,
    contract_period_months: 12,
    procurement_method: "Open Competitive Bidding",
    analysis_status: "COMPLETED",
    created_at: "2026-08-20T09:00:00Z",
    bidder: {
        id: 1,
        company_name: "EduTech Solutions Pvt. Ltd.",
        registration_number: "U72900DL2020PTC123456",
        contact_email: "bids@edutech.example",
        created_at: "2026-09-01T10:00:00Z",
    },
    documents: [
        { id: 1, document_name: "Smart Classroom Tender.pdf", document_type: "TENDER_DOCUMENT", page_count: 42, status: "PROCESSED", uploaded_at: "2026-08-20T09:10:00Z" },
        { id: 2, document_name: "Technical Compliance Sheet.pdf", document_type: "BID_DOCUMENT", page_count: 18, status: "PROCESSED", uploaded_at: "2026-09-01T10:15:00Z" },
        { id: 3, document_name: "Company Credentials.pdf", document_type: "BID_DOCUMENT", page_count: 12, status: "PROCESSED", uploaded_at: "2026-09-01T10:16:00Z" },
    ],
};

export const demoRequirements: Requirement[] = [
    {
        id: 1, tender_id: 1, requirement_code: "TECH-001", title: "Interactive panel display size", requirement_text: "The interactive panel must have a minimum diagonal size of 75 inches.", category: "Technical", mandatory: true, threshold: "75", operator: ">=", source_document: "Smart Classroom Tender.pdf", source_page: 16, source_text: "Minimum 75 inch interactive display", evidence_status: "FOUND", compliance_status: "PASS", confidence: 0.98, priority: "LOW", rule_type: "NUMERIC_THRESHOLD", observed_value: "86 inches", expected_value: "75 inches", assessment: "The submitted specification exceeds the minimum size.", created_at: now,
    },
    {
        id: 2, tender_id: 1, requirement_code: "TECH-002", title: "Processor generation", requirement_text: "The supplied system must use an 11th generation or newer processor.", category: "Technical", mandatory: true, threshold: "11", operator: ">=", source_document: "Smart Classroom Tender.pdf", source_page: 17, source_text: "11th Gen Intel Core i5 or higher", evidence_status: "FOUND", compliance_status: "FAIL", confidence: 0.94, priority: "HIGH", rule_type: "NUMERIC_THRESHOLD", observed_value: "10th Gen Intel Core i5", expected_value: "11th Gen or newer", assessment: "The offered processor is one generation below the mandatory requirement.", created_at: now,
    },
    {
        id: 3, tender_id: 1, requirement_code: "FIN-001", title: "Average annual turnover", requirement_text: "The bidder must have an average annual turnover of at least INR 2 crore over the last three financial years.", category: "Financial", mandatory: true, threshold: "20000000", operator: ">=", source_document: "Smart Classroom Tender.pdf", source_page: 9, source_text: "Average annual turnover: Rs. 2 Crore", evidence_status: "MISSING", compliance_status: "MISSING", confidence: 0.89, priority: "HIGH", rule_type: "NUMERIC_THRESHOLD", observed_value: null, expected_value: "INR 2 crore", assessment: "Audited turnover statement was not found in the submitted documents.", created_at: now,
    },
    {
        id: 4, tender_id: 1, requirement_code: "LEGAL-001", title: "Manufacturer authorization", requirement_text: "A valid manufacturer authorization letter must be submitted with the bid.", category: "Legal", mandatory: true, threshold: null, operator: null, source_document: "Smart Classroom Tender.pdf", source_page: 11, source_text: "Manufacturer authorization is mandatory", evidence_status: "FOUND", compliance_status: "REVIEW_REQUIRED", confidence: 0.82, priority: "HIGH", rule_type: "DOCUMENT_PRESENCE", observed_value: "Authorization letter uploaded", expected_value: "Valid signed authorization", assessment: "The letter is present but the signing authority needs officer verification.", created_at: now,
    },
    {
        id: 5, tender_id: 1, requirement_code: "SERVICE-001", title: "On-site support response time", requirement_text: "The bidder must provide on-site support within 48 hours of a service request.", category: "Service", mandatory: false, threshold: "48", operator: "<=", source_document: "Smart Classroom Tender.pdf", source_page: 23, source_text: "On-site response within 48 hours", evidence_status: "FOUND", compliance_status: "PASS", confidence: 0.96, priority: "LOW", rule_type: "NUMERIC_THRESHOLD", observed_value: "24 hours", expected_value: "48 hours or less", assessment: "The proposed response time meets the service-level requirement.", created_at: now,
    },
];

export const demoAnalysis: AnalysisStatus = { tender_number: "GEM-DEMO-001", status: "COMPLETED", total_requirements: 5, pass_count: 2, fail_count: 1, missing_count: 1, review_count: 1, compliance_percentage: 40 };

export const demoEvidence: Evidence[] = [
    { id: 1, requirement_id: 1, document_id: 2, document_name: "Technical Compliance Sheet.pdf", page_number: 4, source_text: "86 inch 4K interactive flat panel display", extracted_value: "86 inches", confidence: 0.98, evidence_status: "FOUND", assessment: "Exceeds minimum size.", created_at: now },
    { id: 2, requirement_id: 2, document_id: 2, document_name: "Technical Compliance Sheet.pdf", page_number: 5, source_text: "Intel Core i5 10th Gen", extracted_value: "10th Gen", confidence: 0.94, evidence_status: "FOUND", assessment: "Below required generation.", created_at: now },
    { id: 3, requirement_id: 4, document_id: 3, document_name: "Company Credentials.pdf", page_number: 8, source_text: "Authorized Partner Letter", extracted_value: "Authorization letter", confidence: 0.82, evidence_status: "FOUND", assessment: "Requires officer verification.", created_at: now },
];

export const demoVerification: VerificationResult[] = demoRequirements.map((requirement, index) => ({
    id: index + 1,
    requirement_id: requirement.id,
    observed_value: requirement.observed_value,
    expected_value: requirement.expected_value,
    operator: requirement.operator,
    rule: requirement.rule_type,
    calculation: requirement.observed_value ? `${requirement.observed_value} ${requirement.operator ?? "matches"} ${requirement.expected_value ?? "document requirement"}` : null,
    result: requirement.compliance_status,
    confidence: requirement.confidence,
    explanation: requirement.assessment,
    created_at: now,
    requirement,
}));

export const demoRisk: RiskSummary = {
    ...demoAnalysis,
    high_priority: 3,
    medium_priority: 0,
    low_priority: 2,
    items: demoRequirements.filter((requirement) => requirement.priority === "HIGH").map((requirement, index) => ({
        id: index + 1,
        requirement_id: requirement.id,
        priority: requirement.priority,
        risk_factor: requirement.title,
        impact: requirement.compliance_status === "FAIL" ? "Bid may be technically non-compliant." : "Award decision requires supporting evidence.",
        recommendation: requirement.compliance_status === "FAIL" ? "Request clarification or reject the non-compliant specification." : "Verify the original document before final recommendation.",
        created_at: now,
        requirement,
    })),
};

export const demoReport: ReportSummary = {
    tender_number: demoTender.tender_number,
    tender_title: demoTender.title,
    bidder_name: demoTender.bidder?.company_name ?? "Unknown bidder",
    total_requirements: demoAnalysis.total_requirements,
    pass_count: demoAnalysis.pass_count,
    fail_count: demoAnalysis.fail_count,
    missing_count: demoAnalysis.missing_count,
    review_count: demoAnalysis.review_count,
    compliance_percentage: demoAnalysis.compliance_percentage,
    high_priority: demoRisk.high_priority,
    medium_priority: demoRisk.medium_priority,
    low_priority: demoRisk.low_priority,
    requirements: demoRequirements,
    non_pass_requirements: demoRequirements.filter((requirement) => requirement.compliance_status !== "PASS"),
    generated_at: now,
};

export const demoAudit: AuditLog[] = [
    { id: 1, timestamp: now, user: demoUser.full_name, action: "ANALYSIS_COMPLETED", entity: "Tender", entity_id: "1", metadata_json: '{"requirements":5}' },
    { id: 2, timestamp: "2026-09-13T14:20:00Z", user: "System", action: "DOCUMENT_PROCESSED", entity: "Document", entity_id: "2", metadata_json: '{"pages":18}' },
];

export function getDemoRequirementDetail(requirementId: number): RequirementDetail | undefined {
    const requirement = demoRequirements.find((item) => item.id === requirementId);
    if (!requirement) return undefined;

    return {
        ...requirement,
        evidence_records: demoEvidence.filter((evidence) => evidence.requirement_id === requirementId),
        verification: demoVerification.find((result) => result.requirement_id === requirementId) ?? null,
        review_decision: null,
    };
}

export function createDemoReview(requirementId: number, decision: { officer_decision: string; comment?: string }): ReviewDecision {
    return {
        id: Date.now(),
        requirement_id: requirementId,
        original_status: demoRequirements.find((requirement) => requirement.id === requirementId)?.compliance_status ?? "REVIEW_REQUIRED",
        officer_decision: decision.officer_decision,
        comment: decision.comment ?? null,
        reviewed_by: demoUser.full_name,
        reviewed_at: now,
    };
}
