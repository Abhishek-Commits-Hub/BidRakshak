from datetime import datetime

from pydantic import BaseModel


class RequirementResponse(BaseModel):
    id: int
    tender_id: int
    document_id: int
    requirement_code: str
    category: str
    text: str
    canonical_text: str | None
    mandatory: bool
    evidence_required: bool
    metric: str | None
    operator: str | None
    threshold_value: float | None
    unit: str | None
    source_page: int | None
    source_clause: str | None
    severity: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class RequirementExtractionResponse(BaseModel):
    tender_id: int
    document_id: int
    total_requirements: int
    total_constraints: int
    categories: dict[str, int]
