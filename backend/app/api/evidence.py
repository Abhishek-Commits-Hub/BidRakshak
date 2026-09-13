from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.evidence import Evidence
from app.models.requirement import Requirement
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import EvidenceResponse

router = APIRouter(
    prefix="/api",
    tags=["Evidence"]
)


@router.get(
    "/tenders/{tender_number}/evidence",
    response_model=list[EvidenceResponse]
)
def list_evidence(
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

    return (
        db.query(Evidence)
        .filter(Evidence.requirement_id.in_(requirement_ids))
        .order_by(Evidence.requirement_id)
        .all()
    )


@router.get(
    "/requirements/{requirement_id}/evidence",
    response_model=list[EvidenceResponse]
)
def get_requirement_evidence(
    requirement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requirement = db.get(Requirement, requirement_id)

    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found."
        )

    return (
        db.query(Evidence)
        .filter(Evidence.requirement_id == requirement_id)
        .all()
    )
