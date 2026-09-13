from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.requirement import Requirement
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import RequirementResponse, RequirementDetailResponse

router = APIRouter(
    prefix="/api",
    tags=["Requirements"]
)


@router.get(
    "/tenders/{tender_number}/requirements",
    response_model=list[RequirementResponse]
)
def list_requirements(
    tender_number: str,
    category: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
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

    query = (
        db.query(Requirement)
        .filter(Requirement.tender_id == tender.id)
    )

    if category:
        query = query.filter(Requirement.category == category.upper())

    if status_filter:
        query = query.filter(
            Requirement.compliance_status == status_filter.upper()
        )

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Requirement.title.ilike(search_term)) |
            (Requirement.requirement_code.ilike(search_term)) |
            (Requirement.requirement_text.ilike(search_term))
        )

    return (
        query.order_by(Requirement.requirement_code)
        .all()
    )


@router.get(
    "/requirements/{requirement_id}",
    response_model=RequirementDetailResponse
)
def get_requirement(
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

    return requirement
