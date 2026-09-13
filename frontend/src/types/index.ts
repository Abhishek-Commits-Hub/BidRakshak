// ── Auth ────────────────────────────────────────
export interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// ── Tender ──────────────────────────────────────
export interface Tender {
    id: number;
    tender_number: string;
    title: string;
    organization: string;
    description: string | null;
    status: string;
    department: string | null;
    tender_id_display: string | null;
    tender_type: string | null;
    bid_type: string | null;
    estimated_value: number | null;
    emd_amount: number | null;
    bid_validity_days: number | null;
    delivery_period_days: number | null;
    contract_period_months: number | null;
    procurement_method: string | null;
    analysis_status: string;
    created_at: string;
}

export interface Bidder {
    id: number;
    company_name: string;
    registration_number: string;
    contact_email: string | null;
    created_at: string;
}

export interface Document {
    id: number;
    document_name: string;
    document_type: string;
    page_count: number;
    status: string;
    uploaded_at: string;
}

export interface TenderDetail extends Tender {
    bidder: Bidder | null;
    documents: Document[];
}

// ── Requirement ─────────────────────────────────
export interface Requirement {
    id: number;
    tender_id: number;
    requirement_code: string;
    title: string;
    requirement_text: string;
    category: string;
    mandatory: boolean;
    threshold: string | null;
    operator: string | null;
    source_document: string | null;
    source_page: number | null;
    source_text: string | null;
    evidence_status: string;
    compliance_status: string;
    confidence: number;
    priority: string;
    rule_type: string | null;
    observed_value: string | null;
    expected_value: string | null;
    assessment: string | null;
    created_at: string;
}

// ── Evidence ────────────────────────────────────
export interface Evidence {
    id: number;
    requirement_id: number;
    document_id: number | null;
    document_name: string;
    page_number: number | null;
    source_text: string | null;
    extracted_value: string | null;
    confidence: number;
    evidence_status: string;
    assessment: string | null;
    created_at: string;
}

// ── Verification ────────────────────────────────
export interface VerificationResult {
    id: number;
    requirement_id: number;
    observed_value: string | null;
    expected_value: string | null;
    operator: string | null;
    rule: string | null;
    calculation: string | null;
    result: string;
    confidence: number;
    explanation: string | null;
    created_at: string;
    requirement?: Requirement;
}

// ── Review ──────────────────────────────────────
export interface ReviewDecision {
    id: number;
    requirement_id: number;
    original_status: string;
    officer_decision: string;
    comment: string | null;
    reviewed_by: string | null;
    reviewed_at: string;
}

// ── Risk ────────────────────────────────────────
export interface RiskAssessment {
    id: number;
    requirement_id: number;
    priority: string;
    risk_factor: string | null;
    impact: string | null;
    recommendation: string | null;
    created_at: string;
    requirement?: Requirement;
}

export interface RiskSummary {
    total_requirements: number;
    pass_count: number;
    fail_count: number;
    missing_count: number;
    review_count: number;
    compliance_percentage: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    items: RiskAssessment[];
}

// ── Report ──────────────────────────────────────
export interface ReportSummary {
    tender_number: string;
    tender_title: string;
    bidder_name: string;
    total_requirements: number;
    pass_count: number;
    fail_count: number;
    missing_count: number;
    review_count: number;
    compliance_percentage: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    requirements: Requirement[];
    non_pass_requirements: Requirement[];
    generated_at: string | null;
}

// ── Analysis ────────────────────────────────────
export interface AnalysisStatus {
    tender_number: string;
    status: string;
    total_requirements: number;
    pass_count: number;
    fail_count: number;
    missing_count: number;
    review_count: number;
    compliance_percentage: number;
}

// ── Audit ───────────────────────────────────────
export interface AuditLog {
    id: number;
    timestamp: string;
    user: string;
    action: string;
    entity: string | null;
    entity_id: string | null;
    metadata_json: string | null;
}

// ── Requirement Detail ──────────────────────────
export interface RequirementDetail extends Requirement {
    evidence_records: Evidence[];
    verification: VerificationResult | null;
    review_decision: ReviewDecision | null;
}
