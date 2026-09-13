import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.requirement import Requirement
from app.models.review import ReviewDecision
from app.models.user import User
from app.schemas.requirement import ReviewDecisionResponse, ReviewRequest

router = APIRouter(
    prefix="/api",
    tags=["Review"]
)


@router.post(
    "/requirements/{requirement_id}/review",
    response_model=ReviewDecisionResponse
)
def submit_review(
    requirement_id: int,
    review: ReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requirement = db.get(Requirement, requirement_id)

    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found."
        )

    valid_decisions = {"PASS", "FAIL", "MISSING", "REVIEW_REQUIRED"}

    if review.officer_decision not in valid_decisions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid decision. Must be one of: {', '.join(valid_decisions)}"
        )

    # Check for existing review
    existing_review = (
        db.query(ReviewDecision)
        .filter(ReviewDecision.requirement_id == requirement_id)
        .first()
    )

    if existing_review:
        existing_review.officer_decision = review.officer_decision
        existing_review.comment = review.comment
        existing_review.reviewed_by = current_user.full_name
        existing_review.reviewed_at = datetime.utcnow()
    else:
        existing_review = ReviewDecision(
            requirement_id=requirement_id,
            original_status=requirement.compliance_status,
            officer_decision=review.officer_decision,
            comment=review.comment,
            reviewed_by=current_user.full_name,
            reviewed_at=datetime.utcnow()
        )
        db.add(existing_review)

    # Add audit log
    audit = AuditLog(
        user=current_user.email,
        action="OFFICER_REVIEW",
        entity="Requirement",
        entity_id=requirement.requirement_code,
        metadata_json=json.dumps({
            "original_status": requirement.compliance_status,
            "officer_decision": review.officer_decision,
            "comment": review.comment
        })
    )
    db.add(audit)

    db.commit()
    db.refresh(existing_review)

    return existing_review


@router.get(
    "/tenders/{tender_number}/reviews",
    response_model=list[ReviewDecisionResponse]
)
def list_reviews(
    tender_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.tender import Tender

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
        db.query(ReviewDecision)
        .filter(ReviewDecision.requirement_id.in_(requirement_ids))
        .order_by(ReviewDecision.reviewed_at.desc())
        .all()
    )
