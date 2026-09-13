from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.requirement import Requirement
from app.models.risk import RiskAssessment
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import RiskItemResponse, RiskSummaryResponse

router = APIRouter(
    prefix="/api",
    tags=["Risk"]
)


@router.get(
    "/tenders/{tender_number}/risk",
    response_model=RiskSummaryResponse
)
def get_risk_summary(
    tender_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tender = (
        db.query(Tender)
        .filter(Tender.tender_number == tender_number)
        .first()
    )

    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found."
        )

    requirements = (
        db.query(Requirement)
        .filter(Requirement.tender_id == tender.id)
        .all()
    )

    total = len(requirements)
    pass_count = sum(1 for r in requirements if r.compliance_status == "PASS")
    fail_count = sum(1 for r in requirements if r.compliance_status == "FAIL")
    missing_count = sum(1 for r in requirements if r.compliance_status == "MISSING")
    review_count = sum(1 for r in requirements if r.compliance_status == "REVIEW_REQUIRED")
    compliance_pct = round((pass_count / total * 100), 1) if total > 0 else 0.0

    requirement_ids = [r.id for r in requirements]

    risk_items = (
        db.query(RiskAssessment)
        .options(joinedload(RiskAssessment.requirement))
        .filter(RiskAssessment.requirement_id.in_(requirement_ids))
        .all()
    )

    high = sum(1 for r in risk_items if r.priority == "HIGH")
    medium = sum(1 for r in risk_items if r.priority == "MEDIUM")
    low = sum(1 for r in risk_items if r.priority == "LOW")

    return RiskSummaryResponse(
        total_requirements=total,
        pass_count=pass_count,
        fail_count=fail_count,
        missing_count=missing_count,
        review_count=review_count,
        compliance_percentage=compliance_pct,
        high_priority=high,
        medium_priority=medium,
        low_priority=low,
        items=risk_items
    )
