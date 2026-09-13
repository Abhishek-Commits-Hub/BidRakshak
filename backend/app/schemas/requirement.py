from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Requirement ──────────────────────────────────

class RequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tender_id: int
    requirement_code: str
    title: str
    requirement_text: str
    category: str
    mandatory: bool
    threshold: str | None = None
    operator: str | None = None
    source_document: str | None = None
    source_page: int | None = None
    source_text: str | None = None
    evidence_status: str
    compliance_status: str
    confidence: float
    priority: str
    rule_type: str | None = None
    observed_value: str | None = None
    expected_value: str | None = None
    assessment: str | None = None
    created_at: datetime


# ── Evidence ─────────────────────────────────────

class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requirement_id: int
    document_id: int | None = None
    document_name: str
    page_number: int | None = None
    source_text: str | None = None
    extracted_value: str | None = None
    confidence: float
    evidence_status: str
    assessment: str | None = None
    created_at: datetime


# ── Verification ─────────────────────────────────

class VerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requirement_id: int
    observed_value: str | None = None
    expected_value: str | None = None
    operator: str | None = None
    rule: str | None = None
    calculation: str | None = None
    result: str
    confidence: float
    explanation: str | None = None
    created_at: datetime


class VerificationDetailResponse(VerificationResponse):
    requirement: RequirementResponse | None = None


# ── Review ───────────────────────────────────────

class ReviewRequest(BaseModel):
    officer_decision: str
    comment: str | None = None

class ReviewDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requirement_id: int
    original_status: str
    officer_decision: str
    comment: str | None = None
    reviewed_by: str | None = None
    reviewed_at: datetime


# ── Risk ─────────────────────────────────────────

class RiskAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requirement_id: int
    priority: str
    risk_factor: str | None = None
    impact: str | None = None
    recommendation: str | None = None
    created_at: datetime


class RiskItemResponse(RiskAssessmentResponse):
    requirement: RequirementResponse | None = None


class RiskSummaryResponse(BaseModel):
    total_requirements: int
    pass_count: int
    fail_count: int
    missing_count: int
    review_count: int
    compliance_percentage: float
    high_priority: int
    medium_priority: int
    low_priority: int
    items: list[RiskItemResponse] = []


# ── Report ───────────────────────────────────────

class ReportSummaryResponse(BaseModel):
    tender_number: str
    tender_title: str
    bidder_name: str
    total_requirements: int
    pass_count: int
    fail_count: int
    missing_count: int
    review_count: int
    compliance_percentage: float
    high_priority: int
    medium_priority: int
    low_priority: int
    requirements: list[RequirementResponse] = []
    non_pass_requirements: list[RequirementResponse] = []
    generated_at: str | None = None


# ── Audit ────────────────────────────────────────

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    user: str
    action: str
    entity: str | None = None
    entity_id: str | None = None
    metadata_json: str | None = None


# ── Analysis ─────────────────────────────────────

class AnalysisStatusResponse(BaseModel):
    tender_number: str
    status: str
    total_requirements: int
    pass_count: int
    fail_count: int
    missing_count: int
    review_count: int
    compliance_percentage: float


# ── Requirement Detail ───────────────────────────

class RequirementDetailResponse(RequirementResponse):
    evidence_records: list[EvidenceResponse] = []
    verification: VerificationResponse | None = None
    review_decision: ReviewDecisionResponse | None = None
