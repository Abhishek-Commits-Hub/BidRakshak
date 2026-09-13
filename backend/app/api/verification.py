from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.requirement import Requirement
from app.models.tender import Tender
from app.models.user import User
from app.models.verification import VerificationResult
from app.schemas.requirement import VerificationDetailResponse

router = APIRouter(
    prefix="/api",
    tags=["Verification"]
)


@router.get(
    "/tenders/{tender_number}/verification",
    response_model=list[VerificationDetailResponse]
)
def list_verification_results(
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

    requirement_ids = [
        r.id for r in
        db.query(Requirement.id)
        .filter(Requirement.tender_id == tender.id)
        .all()
    ]

    if not requirement_ids:
        return []

    results = (
        db.query(VerificationResult)
        .options(joinedload(VerificationResult.requirement))
        .filter(VerificationResult.requirement_id.in_(requirement_ids))
        .all()
    )

    return results
