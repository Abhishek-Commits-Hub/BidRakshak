from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.organization import Organization
from app.models.tender import Tender
from app.models.user import User
from app.schemas.tender import TenderCreate, TenderResponse
from app.security.auth import get_current_user

router = APIRouter(
    prefix="/tenders",
    tags=["Tenders"]
)

def get_user_organization(
    current_user: User,
    db: Session
):
    organization = db.query(Organization).filter(
        Organization.slug == f"user-{current_user.id}"
    ).first()

    if not organization:
        organization = Organization(
            name=f"{current_user.full_name}'s Organization",
            slug=f"user-{current_user.id}"
        )
        db.add(organization)
        db.commit()
        db.refresh(organization)

    return organization

@router.post(
    "",
    response_model=TenderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_tender(
    data: TenderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    organization = get_user_organization(
        current_user,
        db
    )

    existing = db.query(Tender).filter(
        Tender.reference_number == data.reference_number,
        Tender.organization_id == organization.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tender reference number already exists"
        )

    tender = Tender(
        organization_id=organization.id,
        reference_number=data.reference_number,
        title=data.title,
        issuing_authority=data.issuing_authority,
        description=data.description,
        status="DRAFT"
    )

    db.add(tender)
    db.commit()
    db.refresh(tender)

    return tender

@router.get(
    "",
    response_model=list[TenderResponse]
)
def list_tenders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    organization = get_user_organization(
        current_user,
        db
    )

    tenders = db.query(Tender).filter(
        Tender.organization_id == organization.id
    ).order_by(
        Tender.created_at.desc()
    ).all()

    return tenders

@router.get(
    "/{tender_id}",
    response_model=TenderResponse
)
def get_tender(
    tender_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    organization = get_user_organization(
        current_user,
        db
    )

    tender = db.query(Tender).filter(
        Tender.id == tender_id,
        Tender.organization_id == organization.id
    ).first()

    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    return tender