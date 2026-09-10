from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document, DocumentPage
from app.models.organization import Organization
from app.models.requirement import Requirement
from app.models.requirement_constraint import RequirementConstraint
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import RequirementResponse, RequirementExtractionResponse
from app.security.auth import get_current_user
from app.requirements.extractor import extract_requirements


router = APIRouter(
    prefix="/tenders",
    tags=["Requirements"]
)


def get_authorized_tender(
    tender_id: int,
    current_user: User,
    db: Session
) -> Tender:
    organization = db.query(Organization).filter(
        Organization.slug == f"user-{current_user.id}"
    ).first()

    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )

    tender = db.query(Tender).filter(
        Tender.id == tender_id,
        Tender.organization_id == organization.id
    ).first()

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    return tender


@router.post(
    "/{tender_id}/requirements/extract",
    response_model=RequirementExtractionResponse
)
def extract_tender_requirements(
    tender_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tender = get_authorized_tender(
        tender_id,
        current_user,
        db
    )

    document = db.query(Document).filter(
        Document.tender_id == tender.id,
        Document.document_type == "TENDER"
    ).order_by(
        Document.created_at.desc()
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="No tender document found"
        )

    pages = db.query(DocumentPage).filter(
        DocumentPage.document_id == document.id
    ).order_by(
        DocumentPage.page_number
    ).all()

    if not pages:
        raise HTTPException(
            status_code=404,
            detail="No extracted document pages found"
        )

    page_data = [
        {
            "page_number": page.page_number,
            "text": page.text
        }
        for page in pages
    ]

    extracted = extract_requirements(
        page_data
    )

    old_requirements = db.query(Requirement).filter(
        Requirement.tender_id == tender.id
    ).all()

    old_requirement_ids = [
        requirement.id
        for requirement in old_requirements
    ]

    if old_requirement_ids:
        db.query(RequirementConstraint).filter(
            RequirementConstraint.requirement_id.in_(
                old_requirement_ids
            )
        ).delete(
            synchronize_session=False
        )

    db.query(Requirement).filter(
        Requirement.tender_id == tender.id
    ).delete(
        synchronize_session=False
    )

    db.flush()

    requirements = []
    constraint_count = 0

    for index, candidate in enumerate(
        extracted,
        start=1
    ):
        requirement = Requirement(
            tender_id=tender.id,
            document_id=document.id,
            requirement_code=f"REQ-{index:03d}",
            category=candidate.category,
            text=candidate.text,
            canonical_text=candidate.text,
            mandatory=candidate.mandatory,
            evidence_required=candidate.evidence_required,
            metric=(
                candidate.constraints[0].metric
                if candidate.constraints
                else None
            ),
            operator=(
                candidate.constraints[0].operator
                if candidate.constraints
                else None
            ),
            threshold_value=(
                candidate.constraints[0].value
                if candidate.constraints
                else None
            ),
            unit=(
                candidate.constraints[0].unit
                if candidate.constraints
                else None
            ),
            source_page=candidate.source_page,
            source_clause=candidate.source_clause,
            severity=candidate.severity,
            status="EXTRACTED"
        )

        db.add(requirement)
        db.flush()

        requirements.append(
            requirement
        )

        for sequence, constraint in enumerate(
            candidate.constraints,
            start=1
        ):
            db.add(
                RequirementConstraint(
                    requirement_id=requirement.id,
                    metric=constraint.metric,
                    operator=constraint.operator,
                    value=constraint.value,
                    unit=constraint.unit,
                    qualifier=constraint.qualifier,
                    context=constraint.context,
                    source_text=constraint.source_text,
                    sequence=sequence
                )
            )

            constraint_count += 1

    db.commit()

    for requirement in requirements:
        db.refresh(requirement)

    categories = {}

    for requirement in requirements:
        categories[requirement.category] = (
            categories.get(
                requirement.category,
                0
            ) + 1
        )

    return RequirementExtractionResponse(
        tender_id=tender.id,
        document_id=document.id,
        total_requirements=len(requirements),
        total_constraints=constraint_count,
        categories=categories
    )


@router.get(
    "/{tender_id}/requirements",
    response_model=list[RequirementResponse]
)
def list_requirements(
    tender_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tender = get_authorized_tender(
        tender_id,
        current_user,
        db
    )

    return db.query(Requirement).filter(
        Requirement.tender_id == tender.id
    ).order_by(
        Requirement.id
    ).all()


@router.get(
    "/{tender_id}/requirements/{requirement_id}",
    response_model=RequirementResponse
)
def get_requirement(
    tender_id: int,
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tender = get_authorized_tender(
        tender_id,
        current_user,
        db
    )

    requirement = db.query(Requirement).filter(
        Requirement.id == requirement_id,
        Requirement.tender_id == tender.id
    ).first()

    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found"
        )

    return requirement
from app.schemas.requirement_constraint import RequirementConstraintResponse


@router.get(
    "/{tender_id}/requirements/{requirement_id}/constraints",
    response_model=list[RequirementConstraintResponse]
)
def list_requirement_constraints(
    tender_id: int,
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tender = get_authorized_tender(
        tender_id,
        current_user,
        db
    )

    requirement = db.query(Requirement).filter(
        Requirement.id == requirement_id,
        Requirement.tender_id == tender.id
    ).first()

    if not requirement:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found"
        )

    return db.query(RequirementConstraint).filter(
        RequirementConstraint.requirement_id == requirement.id
    ).order_by(
        RequirementConstraint.sequence
    ).all()
