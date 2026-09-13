from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.requirement import Requirement
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import AnalysisStatusResponse

router = APIRouter(
    prefix="/api",
    tags=["Analysis"]
)


@router.get(
    "/tenders/{tender_number}/analysis",
    response_model=AnalysisStatusResponse
)
def get_analysis(
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

    return AnalysisStatusResponse(
        tender_number=tender.tender_number,
        status=tender.analysis_status,
        total_requirements=total,
        pass_count=pass_count,
        fail_count=fail_count,
        missing_count=missing_count,
        review_count=review_count,
        compliance_percentage=compliance_pct
    )


@router.post(
    "/tenders/{tender_number}/analysis",
    response_model=AnalysisStatusResponse
)
def run_analysis(
    tender_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger analysis — for the demo, returns the pre-seeded results."""
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

    # Mark as completed (demo data already seeded)
    tender.analysis_status = "COMPLETED"
    db.commit()

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

    return AnalysisStatusResponse(
        tender_number=tender.tender_number,
        status="COMPLETED",
        total_requirements=total,
        pass_count=pass_count,
        fail_count=fail_count,
        missing_count=missing_count,
        review_count=review_count,
        compliance_percentage=compliance_pct
    )
