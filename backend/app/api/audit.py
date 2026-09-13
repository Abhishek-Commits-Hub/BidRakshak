from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import AuditLogResponse

router = APIRouter(
    prefix="/api",
    tags=["Audit"]
)


@router.get(
    "/tenders/{tender_number}/audit",
    response_model=list[AuditLogResponse]
)
def get_audit_trail(
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

    return (
        db.query(AuditLog)
        .filter(AuditLog.entity_id == tender_number)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )
