import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.requirement import Requirement
from app.models.review import ReviewDecision
from app.models.tender import Tender
from app.models.user import User
from app.schemas.requirement import ReportSummaryResponse
from app.services.report_service import generate_compliance_report

router = APIRouter(
    prefix="/api",
    tags=["Report"]
)


def _build_report_data(tender, requirements, db) -> dict:
    total = len(requirements)
    pass_count = sum(1 for r in requirements if r.compliance_status == "PASS")
    fail_count = sum(1 for r in requirements if r.compliance_status == "FAIL")
    missing_count = sum(1 for r in requirements if r.compliance_status == "MISSING")
    review_count = sum(1 for r in requirements if r.compliance_status == "REVIEW_REQUIRED")
    compliance_pct = round((pass_count / total * 100), 1) if total > 0 else 0.0

    from app.models.risk import RiskAssessment
    req_ids = [r.id for r in requirements]
    risk_items = db.query(RiskAssessment).filter(
        RiskAssessment.requirement_id.in_(req_ids)
    ).all()

    high = sum(1 for r in risk_items if r.priority == "HIGH")
    medium = sum(1 for r in risk_items if r.priority == "MEDIUM")
    low = sum(1 for r in risk_items if r.priority == "LOW")

    non_pass = [r for r in requirements if r.compliance_status != "PASS"]

    # Officer decisions
    reviews = db.query(ReviewDecision).filter(
        ReviewDecision.requirement_id.in_(req_ids)
    ).all()

    officer_decisions = []
    for rev in reviews:
        req = db.get(Requirement, rev.requirement_id)
        officer_decisions.append({
            "requirement_code": req.requirement_code if req else "",
            "requirement_title": req.title if req else "",
            "original_status": rev.original_status,
            "officer_decision": rev.officer_decision,
            "comment": rev.comment
        })

    bidder_name = ""
    if tender.bidder:
        bidder_name = tender.bidder.company_name

    return {
        "tender_number": tender.tender_number,
        "tender_title": tender.title,
        "bidder_name": bidder_name,
        "total_requirements": total,
        "pass_count": pass_count,
        "fail_count": fail_count,
        "missing_count": missing_count,
        "review_count": review_count,
        "compliance_percentage": compliance_pct,
        "high_priority": high,
        "medium_priority": medium,
        "low_priority": low,
        "requirements": [
            {
                "requirement_code": r.requirement_code,
                "title": r.title,
                "category": r.category,
                "compliance_status": r.compliance_status,
                "evidence_status": r.evidence_status,
                "confidence": r.confidence,
                "assessment": r.assessment
            }
            for r in requirements
        ],
        "non_pass_requirements": [
            {
                "requirement_code": r.requirement_code,
                "title": r.title,
                "category": r.category,
                "compliance_status": r.compliance_status,
                "evidence_status": r.evidence_status,
                "confidence": r.confidence,
                "assessment": r.assessment
            }
            for r in non_pass
        ],
        "officer_decisions": officer_decisions
    }


@router.get(
    "/tenders/{tender_number}/report",
    response_model=ReportSummaryResponse
)
def get_report(
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
        .order_by(Requirement.requirement_code)
        .all()
    )

    data = _build_report_data(tender, requirements, db)
    data["generated_at"] = datetime.utcnow().isoformat()

    return data


@router.post(
    "/tenders/{tender_number}/report/generate"
)
def generate_pdf_report(
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
        .order_by(Requirement.requirement_code)
        .all()
    )

    report_data = _build_report_data(tender, requirements, db)
    pdf_bytes = generate_compliance_report(report_data)

    # Audit log
    audit = AuditLog(
        user=current_user.email,
        action="REPORT_GENERATED",
        entity="Tender",
        entity_id=tender_number,
        metadata_json=json.dumps({"format": "PDF"})
    )
    db.add(audit)
    db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=BidRakshak_Report_{tender_number}.pdf"
        }
    )
