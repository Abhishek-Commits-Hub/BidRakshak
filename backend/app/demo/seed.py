"""
BidRakshak Deterministic Demo Data Seeding

Creates the complete demonstration dataset:
- Demo user (demo@bidrakshak.gov.in / BidRakshak@123)
- GEM-DEMO-001 tender with full metadata
- TechNova Solutions bidder
- 7 bidder documents
- 42 requirements across all categories
- Evidence mappings
- Verification results
- Risk assessments
- Audit trail

All data is deterministic and idempotent.
"""
import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.audit import AuditLog
from app.models.bidder import Bidder
from app.models.document import Document
from app.models.evidence import Evidence
from app.models.requirement import Requirement
from app.models.review import ReviewDecision
from app.models.risk import RiskAssessment
from app.models.tender import Tender
from app.models.user import User
from app.models.verification import VerificationResult


def seed_demo_data(db: Session):
    """Main seed function — idempotent."""
    existing = (
        db.query(Tender)
        .filter(Tender.tender_number == "GEM-DEMO-001")
        .first()
    )
    if existing:
        return existing

    # ── 1. Demo user ─────────────────────────────
    user = db.query(User).filter(
        User.email == "demo@bidrakshak.gov.in"
    ).first()

    if not user:
        user = User(
            email="demo@bidrakshak.gov.in",
            full_name="Procurement Officer",
            hashed_password=hash_password("BidRakshak@123"),
            is_active=True
        )
        db.add(user)
        db.flush()

    # ── 2. Tender ────────────────────────────────
    tender = Tender(
        tender_number="GEM-DEMO-001",
        title="Supply of Computer Equipment",
        organization="Government Procurement Department",
        description=(
            "Procurement of desktop computers, monitors, and peripherals "
            "for the Directorate of Digital Infrastructure under GeM guidelines."
        ),
        status="ACTIVE",
        department="Directorate of Digital Infrastructure",
        tender_id_display="DEMO-GEM-2026-001",
        tender_type="Open Competitive Procurement",
        bid_type="Two-Bid System",
        estimated_value=4850000.0,
        emd_amount=97000.0,
        bid_validity_days=180,
        delivery_period_days=45,
        contract_period_months=12,
        procurement_method="Open Tender",
        analysis_status="COMPLETED"
    )
    db.add(tender)
    db.flush()

    # ── 3. Bidder ────────────────────────────────
    bidder = Bidder(
        tender_id=tender.id,
        company_name="TechNova Solutions Pvt. Ltd.",
        registration_number="U62090JH2022PTC018765",
        contact_email="procurement@technova.example"
    )
    db.add(bidder)
    db.flush()

    # ── 4. Documents ─────────────────────────────
    docs_data = [
        {"name": "Sample-Tender.pdf", "type": "TENDER_DOCUMENT", "pages": 27, "status": "PROCESSED"},
        {"name": "Company Profile.pdf", "type": "BID_DOCUMENT", "pages": 12, "status": "PROCESSED"},
        {"name": "Financial Statement.pdf", "type": "BID_DOCUMENT", "pages": 18, "status": "PROCESSED"},
        {"name": "Experience Certificates.pdf", "type": "BID_DOCUMENT", "pages": 8, "status": "PROCESSED"},
        {"name": "Technical Compliance.pdf", "type": "BID_DOCUMENT", "pages": 15, "status": "PROCESSED"},
        {"name": "OEM Authorisation.pdf", "type": "BID_DOCUMENT", "pages": 3, "status": "PROCESSED"},
        {"name": "Declarations.pdf", "type": "BID_DOCUMENT", "pages": 6, "status": "PROCESSED"},
    ]

    doc_map = {}
    for dd in docs_data:
        doc = Document(
            tender_id=tender.id,
            document_name=dd["name"],
            document_type=dd["type"],
            page_count=dd["pages"],
            status=dd["status"]
        )
        db.add(doc)
        db.flush()
        doc_map[dd["name"]] = doc

    # ── 5. Requirements (42 total) ───────────────
    # 29 PASS, 5 FAIL, 4 MISSING, 4 REVIEW_REQUIRED
    requirements_data = _get_requirements_data()

    req_map = {}
    for rd in requirements_data:
        req = Requirement(
            tender_id=tender.id,
            requirement_code=rd["code"],
            title=rd["title"],
            requirement_text=rd["text"],
            category=rd["category"],
            mandatory=rd["mandatory"],
            threshold=rd.get("threshold"),
            operator=rd.get("operator"),
            source_document=rd.get("source_document", "Sample-Tender.pdf"),
            source_page=rd.get("source_page"),
            source_text=rd.get("source_text"),
            evidence_status=rd["evidence_status"],
            compliance_status=rd["compliance_status"],
            confidence=rd["confidence"],
            priority=rd["priority"],
            rule_type=rd.get("rule_type"),
            observed_value=rd.get("observed_value"),
            expected_value=rd.get("expected_value"),
            assessment=rd.get("assessment")
        )
        db.add(req)
        db.flush()
        req_map[rd["code"]] = req

    # ── 6. Evidence ──────────────────────────────
    evidence_data = _get_evidence_data()

    for ed in evidence_data:
        req = req_map.get(ed["req_code"])
        if not req:
            continue

        doc = doc_map.get(ed.get("document_name", ""))

        ev = Evidence(
            requirement_id=req.id,
            document_id=doc.id if doc else None,
            document_name=ed.get("document_name", "N/A"),
            page_number=ed.get("page_number"),
            source_text=ed.get("source_text"),
            extracted_value=ed.get("extracted_value"),
            confidence=ed.get("confidence", 0.0),
            evidence_status=ed.get("evidence_status", "NOT_FOUND"),
            assessment=ed.get("assessment")
        )
        db.add(ev)

    db.flush()

    # ── 7. Verification Results ──────────────────
    verification_data = _get_verification_data()

    for vd in verification_data:
        req = req_map.get(vd["req_code"])
        if not req:
            continue

        vr = VerificationResult(
            requirement_id=req.id,
            observed_value=vd.get("observed_value"),
            expected_value=vd.get("expected_value"),
            operator=vd.get("operator"),
            rule=vd.get("rule"),
            calculation=vd.get("calculation"),
            result=vd.get("result"),
            confidence=vd.get("confidence", 0.0),
            explanation=vd.get("explanation")
        )
        db.add(vr)

    db.flush()

    # ── 8. Risk Assessments ──────────────────────
    risk_data = _get_risk_data()

    for rkd in risk_data:
        req = req_map.get(rkd["req_code"])
        if not req:
            continue

        ra = RiskAssessment(
            requirement_id=req.id,
            priority=rkd["priority"],
            risk_factor=rkd.get("risk_factor"),
            impact=rkd.get("impact"),
            recommendation=rkd.get("recommendation")
        )
        db.add(ra)

    db.flush()

    # ── 9. Audit Trail ───────────────────────────
    audit_entries = [
        {"action": "USER_LOGIN", "entity": "User", "entity_id": "demo@bidrakshak.gov.in",
         "metadata_json": json.dumps({"method": "demo_seed"})},
        {"action": "TENDER_OPENED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"title": "Supply of Computer Equipment"})},
        {"action": "ANALYSIS_STARTED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"requirements_count": 42})},
        {"action": "DOCUMENTS_PROCESSED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"documents_count": 7})},
        {"action": "REQUIREMENTS_EXTRACTED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"total": 42, "categories": 8})},
        {"action": "EVIDENCE_MAPPED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"evidence_count": 38})},
        {"action": "VERIFICATION_COMPLETED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"pass": 29, "fail": 5, "missing": 4, "review": 4})},
        {"action": "ANALYSIS_COMPLETED", "entity": "Tender", "entity_id": "GEM-DEMO-001",
         "metadata_json": json.dumps({"compliance_percentage": 78})},
    ]

    for ae in audit_entries:
        al = AuditLog(
            user="demo@bidrakshak.gov.in",
            action=ae["action"],
            entity=ae.get("entity"),
            entity_id=ae.get("entity_id"),
            metadata_json=ae.get("metadata_json")
        )
        db.add(al)

    db.commit()
    db.refresh(tender)

    return tender


def _get_requirements_data() -> list[dict]:
    """All 42 deterministic requirements."""
    return [
        # ── ELIGIBILITY (7) ──────────────────────
        {
            "code": "ELIG-001", "title": "Legal registration as a company/firm",
            "text": "Bidder must be a company registered under the Companies Act or a partnership firm registered under the relevant act.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 95.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 5, "source_text": "The bidder must be a registered company or firm.",
            "assessment": "Company registration certificate (CIN: U62090JH2022PTC018765) verified from Company Profile."
        },
        {
            "code": "ELIG-002", "title": "Relevant business experience in IT equipment supply",
            "text": "Bidder must have at least 3 years of experience in supply of IT/computer equipment to government or corporate entities.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 92.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "3", "operator": ">=",
            "observed_value": "5", "expected_value": "3",
            "source_page": 5, "source_text": "Minimum 3 years of experience in IT equipment supply.",
            "assessment": "Company Profile indicates establishment in 2020, with 5 years of relevant experience documented."
        },
        {
            "code": "ELIG-003", "title": "Three similar completed contracts",
            "text": "Bidder must have successfully completed at least three similar contracts of comparable value in the last five years.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "PARTIAL", "compliance_status": "REVIEW_REQUIRED", "confidence": 68.0,
            "priority": "HIGH", "rule_type": "COUNT_MINIMUM",
            "threshold": "3", "operator": ">=",
            "observed_value": "2", "expected_value": "3",
            "source_page": 6, "source_text": "At least three similar contracts of comparable value completed in the last 5 years.",
            "assessment": "Two completed contracts are clearly verified. A third contract reference exists but could not be conclusively verified from the submitted documentation."
        },
        {
            "code": "ELIG-004", "title": "Not blacklisted by any government entity",
            "text": "Bidder must not be blacklisted or debarred by any Central/State Government entity.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 90.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 5, "source_text": "Bidder must not be blacklisted or debarred.",
            "assessment": "Self-declaration of non-blacklisting submitted and verified."
        },
        {
            "code": "ELIG-005", "title": "Valid GST registration",
            "text": "Bidder must have a valid GST registration certificate.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 97.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "Valid GST registration certificate.",
            "assessment": "GST certificate (GSTIN: 20AABCT1234F1ZV) found in Declarations.pdf, valid and current."
        },
        {
            "code": "ELIG-006", "title": "Valid PAN",
            "text": "Bidder must possess a valid PAN issued by Income Tax Department.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 98.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "Valid PAN card.",
            "assessment": "PAN (AABCT1234F) verified from Company Profile."
        },
        {
            "code": "ELIG-007", "title": "GeM registration",
            "text": "Bidder must be registered on the Government e-Marketplace (GeM) portal.",
            "category": "ELIGIBILITY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 88.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 5, "source_text": "Registration on GeM portal is mandatory.",
            "assessment": "GeM Seller ID referenced in Company Profile."
        },

        # ── FINANCIAL (6) ────────────────────────
        {
            "code": "FIN-001", "title": "Minimum average annual turnover of ₹50 lakh",
            "text": "Bidder must have an average annual turnover of not less than ₹50 lakh in the last three financial years.",
            "category": "FINANCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 96.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "50", "operator": ">=",
            "observed_value": "74.2", "expected_value": "50",
            "source_page": 6, "source_text": "Average annual turnover not less than ₹50 lakh in the last 3 financial years.",
            "assessment": "Financial Statement shows average annual turnover of ₹74.2 lakh over FY2023-24, FY2024-25, and FY2025-26."
        },
        {
            "code": "FIN-002", "title": "Positive net worth",
            "text": "Bidder must have a positive net worth as per the latest audited balance sheet.",
            "category": "FINANCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 94.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 6, "source_text": "Positive net worth as per latest audited balance sheet.",
            "assessment": "Positive net worth of ₹1.24 crore confirmed from Financial Statement."
        },
        {
            "code": "FIN-003", "title": "EMD of ₹97,000",
            "text": "Earnest Money Deposit of ₹97,000 must be submitted in the prescribed format.",
            "category": "FINANCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 93.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 4, "source_text": "EMD: ₹97,000.",
            "assessment": "EMD of ₹97,000 submitted via bank guarantee, referenced in bid submission."
        },
        {
            "code": "FIN-004", "title": "No overdue statutory liabilities",
            "text": "Bidder must have no overdue statutory liabilities (taxes, provident fund, ESI, etc.).",
            "category": "FINANCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 85.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "No overdue statutory liabilities.",
            "assessment": "Declaration of no overdue statutory liabilities signed and submitted."
        },
        {
            "code": "FIN-005", "title": "Solvency certificate",
            "text": "Bidder must submit a solvency certificate from a scheduled bank.",
            "category": "FINANCIAL", "mandatory": False,
            "evidence_status": "NOT_FOUND", "compliance_status": "MISSING", "confidence": 0.0,
            "priority": "MEDIUM", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Not Found", "expected_value": "Required",
            "source_page": 7, "source_text": "Solvency certificate from a scheduled bank.",
            "assessment": "Solvency certificate was not found in the bid submission."
        },
        {
            "code": "FIN-006", "title": "Performance security undertaking",
            "text": "Bidder must submit an undertaking for performance security of 5% of contract value.",
            "category": "FINANCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 91.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 11, "source_text": "Performance security of 5% of contract value.",
            "assessment": "Performance security undertaking found in Declarations.pdf."
        },

        # ── TECHNICAL (10) ───────────────────────
        {
            "code": "TECH-001", "title": "Processor: Intel Core i5 or equivalent",
            "text": "Desktop computers must be equipped with Intel Core i5 12th Generation or AMD Ryzen 5 5000 series or equivalent processor.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 94.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Intel Core i5-12400", "expected_value": "Intel Core i5 12th Gen or equivalent",
            "source_page": 7, "source_text": "Intel Core i5 12th Generation or equivalent processor.",
            "assessment": "Technical Compliance sheet specifies Intel Core i5-12400, which meets the requirement."
        },
        {
            "code": "TECH-002", "title": "RAM: Minimum 16 GB DDR4",
            "text": "Each desktop must have a minimum of 16 GB DDR4 RAM, expandable to 64 GB.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 95.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "16", "operator": ">=",
            "observed_value": "16", "expected_value": "16",
            "source_page": 7, "source_text": "Minimum 16 GB DDR4 RAM.",
            "assessment": "16 GB DDR4 RAM specified in Technical Compliance, matching the requirement exactly."
        },
        {
            "code": "TECH-003", "title": "Storage: 512 GB SSD",
            "text": "Each desktop must have at least 512 GB NVMe SSD storage.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 96.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "512", "operator": ">=",
            "observed_value": "512", "expected_value": "512",
            "source_page": 7, "source_text": "At least 512 GB NVMe SSD.",
            "assessment": "512 GB NVMe SSD confirmed in Technical Compliance sheet."
        },
        {
            "code": "TECH-004", "title": "Base clock speed not less than 2.5 GHz",
            "text": "The processor base clock speed must not be less than 2.5 GHz.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "FAIL", "confidence": 97.0,
            "priority": "HIGH", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "2.5", "operator": ">=",
            "observed_value": "2.2", "expected_value": "2.5",
            "source_page": 7, "source_text": "Base clock speed not less than 2.5 GHz.",
            "assessment": "Technical Compliance sheet indicates base clock of 2.2 GHz, which is below the required 2.5 GHz threshold."
        },
        {
            "code": "TECH-005", "title": "Monitor: 21.5 inch FHD",
            "text": "Monitor must be at least 21.5 inches with Full HD (1920x1080) resolution.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 93.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "21.5", "operator": ">=",
            "observed_value": "23.8", "expected_value": "21.5",
            "source_page": 8, "source_text": "Monitor: minimum 21.5 inches, Full HD.",
            "assessment": "23.8 inch FHD monitor offered, exceeding the minimum requirement."
        },
        {
            "code": "TECH-006", "title": "Ethernet: Gigabit LAN",
            "text": "Each desktop must have integrated Gigabit Ethernet (10/100/1000 Mbps).",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 91.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 8, "source_text": "Integrated Gigabit Ethernet.",
            "assessment": "Gigabit LAN confirmed in Technical Compliance sheet."
        },
        {
            "code": "TECH-007", "title": "USB ports: minimum 6",
            "text": "Each desktop must have at least 6 USB ports including at least 2 USB 3.0 ports.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 90.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "6", "operator": ">=",
            "observed_value": "8", "expected_value": "6",
            "source_page": 8, "source_text": "Minimum 6 USB ports including 2 USB 3.0.",
            "assessment": "8 USB ports offered (4x USB 3.0 + 4x USB 2.0), exceeding the requirement."
        },
        {
            "code": "TECH-008", "title": "Operating system: Windows 11 Professional or equivalent",
            "text": "Each desktop must be pre-loaded with Windows 11 Professional or equivalent with valid license.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 92.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 8, "source_text": "Pre-loaded Windows 11 Professional.",
            "assessment": "Windows 11 Professional OEM license included per Technical Compliance sheet."
        },
        {
            "code": "TECH-009", "title": "Keyboard and mouse: standard wired",
            "text": "Each desktop must include a standard wired USB keyboard and optical mouse.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 88.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 8, "source_text": "Standard wired USB keyboard and optical mouse.",
            "assessment": "Wired keyboard and mouse included in the offer."
        },
        {
            "code": "TECH-010", "title": "Power supply: energy star rated",
            "text": "Desktop power supply must be Energy Star rated and suitable for Indian power conditions.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "PARTIAL", "compliance_status": "REVIEW_REQUIRED", "confidence": 72.0,
            "priority": "MEDIUM", "rule_type": "BOOLEAN",
            "observed_value": "Partial", "expected_value": "Yes",
            "source_page": 8, "source_text": "Energy Star rated power supply.",
            "assessment": "Power supply specifications mention energy efficiency but Energy Star certification is not explicitly documented."
        },

        # ── STATUTORY (5) ────────────────────────
        {
            "code": "STAT-001", "title": "BIS certification for equipment",
            "text": "All IT equipment must have Bureau of Indian Standards (BIS) certification.",
            "category": "STATUTORY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 89.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "BIS certification for all IT equipment.",
            "assessment": "BIS certification referenced in Technical Compliance and OEM Authorisation."
        },
        {
            "code": "STAT-002", "title": "RoHS compliance",
            "text": "Equipment must comply with Restriction of Hazardous Substances (RoHS) directive.",
            "category": "STATUTORY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 87.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "RoHS compliance.",
            "assessment": "RoHS compliance declaration found in OEM Authorisation document."
        },
        {
            "code": "STAT-003", "title": "EPR registration",
            "text": "Manufacturer/OEM must have valid Extended Producer Responsibility (EPR) registration with CPCB.",
            "category": "STATUTORY", "mandatory": True,
            "evidence_status": "NOT_FOUND", "compliance_status": "MISSING", "confidence": 0.0,
            "priority": "HIGH", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Not Found", "expected_value": "Required",
            "source_page": 9, "source_text": "Valid EPR registration with CPCB.",
            "assessment": "EPR registration certificate was not found in the bid submission."
        },
        {
            "code": "STAT-004", "title": "Income Tax returns for 3 years",
            "text": "Bidder must submit copies of Income Tax Returns for the last three assessment years.",
            "category": "STATUTORY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 91.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "Income Tax Returns for last 3 years.",
            "assessment": "ITR copies for AY 2023-24, 2024-25, and 2025-26 found in Financial Statement."
        },
        {
            "code": "STAT-005", "title": "Labour law compliance",
            "text": "Bidder must comply with all applicable labour laws including Minimum Wages Act, EPF, and ESI.",
            "category": "STATUTORY", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 84.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 9, "source_text": "Compliance with all applicable labour laws.",
            "assessment": "Self-declaration of labour law compliance submitted in Declarations.pdf."
        },

        # ── DOCUMENT (6) ─────────────────────────
        {
            "code": "DOC-001", "title": "Company profile document",
            "text": "Bidder must submit a detailed company profile including organisational structure and key personnel.",
            "category": "DOCUMENT", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 95.0,
            "priority": "LOW", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Found", "expected_value": "Required",
            "source_page": 13, "source_text": "Detailed company profile.",
            "assessment": "Company Profile.pdf (12 pages) submitted with organisational structure."
        },
        {
            "code": "DOC-002", "title": "Audited financial statements",
            "text": "Audited financial statements for the last three financial years must be submitted.",
            "category": "DOCUMENT", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 94.0,
            "priority": "LOW", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Found", "expected_value": "Required",
            "source_page": 13, "source_text": "Audited financial statements for last 3 years.",
            "assessment": "Financial Statement.pdf (18 pages) submitted with audited statements."
        },
        {
            "code": "DOC-003", "title": "Technical compliance sheet",
            "text": "Bidder must submit a filled-in Technical Compliance Sheet as per Annexure format.",
            "category": "DOCUMENT", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 93.0,
            "priority": "LOW", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Found", "expected_value": "Required",
            "source_page": 14, "source_text": "Technical Compliance Sheet as per Annexure.",
            "assessment": "Technical Compliance.pdf (15 pages) submitted in prescribed format."
        },
        {
            "code": "DOC-004", "title": "OEM authorisation letter",
            "text": "Bidder must submit valid OEM authorisation letter for the quoted products.",
            "category": "DOCUMENT", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 90.0,
            "priority": "LOW", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Found", "expected_value": "Required",
            "source_page": 15, "source_text": "OEM authorisation letter for quoted products.",
            "assessment": "OEM Authorisation.pdf (3 pages) from Dell Technologies submitted."
        },
        {
            "code": "DOC-005", "title": "Signed declarations and undertakings",
            "text": "All required declarations and undertakings must be signed and submitted.",
            "category": "DOCUMENT", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 92.0,
            "priority": "LOW", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Found", "expected_value": "Required",
            "source_page": 16, "source_text": "Signed declarations and undertakings.",
            "assessment": "Declarations.pdf (6 pages) with all required declarations submitted."
        },
        {
            "code": "DOC-006", "title": "ISO 9001:2015 quality management certificate",
            "text": "Bidder or OEM must submit a valid ISO 9001:2015 Quality Management System certificate.",
            "category": "DOCUMENT", "mandatory": True,
            "evidence_status": "NOT_FOUND", "compliance_status": "MISSING", "confidence": 0.0,
            "priority": "HIGH", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Not Found", "expected_value": "Required",
            "source_page": 9, "source_text": "Valid ISO 9001:2015 certificate.",
            "assessment": "ISO 9001:2015 certificate was not found in any submitted document."
        },

        # ── COMMERCIAL (4) ───────────────────────
        {
            "code": "COM-001", "title": "Warranty: minimum 3 years comprehensive",
            "text": "Equipment must carry a comprehensive onsite warranty of minimum 3 years from date of delivery.",
            "category": "COMMERCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 91.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "3", "operator": ">=",
            "observed_value": "3", "expected_value": "3",
            "source_page": 10, "source_text": "Comprehensive onsite warranty minimum 3 years.",
            "assessment": "3-year comprehensive onsite warranty offered in Technical Compliance."
        },
        {
            "code": "COM-002", "title": "Delivery within 45 days",
            "text": "Complete delivery must be made within 45 days from the date of purchase order.",
            "category": "COMMERCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "FAIL", "confidence": 94.0,
            "priority": "HIGH", "rule_type": "NUMERIC_MAXIMUM",
            "threshold": "45", "operator": "<=",
            "observed_value": "60", "expected_value": "45",
            "source_page": 4, "source_text": "Delivery within 45 days of purchase order.",
            "assessment": "Bidder proposed delivery timeline of 60 days, exceeding the maximum allowed 45 days."
        },
        {
            "code": "COM-003", "title": "Payment terms acceptance",
            "text": "Bidder must accept payment terms of 100% payment after delivery, inspection, and acceptance.",
            "category": "COMMERCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 89.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 11, "source_text": "100% payment after delivery, inspection and acceptance.",
            "assessment": "Payment terms accepted as per declaration."
        },
        {
            "code": "COM-004", "title": "Liquidated damages clause acceptance",
            "text": "Bidder must accept liquidated damages of 0.5% per week of delay, up to maximum 10% of contract value.",
            "category": "COMMERCIAL", "mandatory": True,
            "evidence_status": "PARTIAL", "compliance_status": "REVIEW_REQUIRED", "confidence": 74.0,
            "priority": "MEDIUM", "rule_type": "BOOLEAN",
            "observed_value": "Partial", "expected_value": "Yes",
            "source_page": 11, "source_text": "LD of 0.5% per week, maximum 10%.",
            "assessment": "Bidder has accepted LD clause but proposed a cap of 5% instead of 10%. Requires officer review."
        },

        # ── EXPERIENCE (2) ───────────────────────
        {
            "code": "EXP-001", "title": "Prior government supply experience",
            "text": "Bidder must have experience of supplying IT equipment to at least one Central or State Government department.",
            "category": "EXPERIENCE", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 88.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 6, "source_text": "Experience supplying to government department.",
            "assessment": "Experience Certificates show supply to Ministry of Education and State IT Department."
        },
        {
            "code": "EXP-002", "title": "Single contract of minimum ₹20 lakh",
            "text": "Bidder must have completed at least one single contract of value not less than ₹20 lakh.",
            "category": "EXPERIENCE", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 93.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "20", "operator": ">=",
            "observed_value": "32.5", "expected_value": "20",
            "source_page": 6, "source_text": "Single contract not less than ₹20 lakh.",
            "assessment": "Highest single contract of ₹32.5 lakh verified from Experience Certificates."
        },

        # ── GENERAL (2) ──────────────────────────
        {
            "code": "GEN-001", "title": "Bid validity of 180 days",
            "text": "Bid must remain valid for 180 days from the date of bid opening.",
            "category": "GENERAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 90.0,
            "priority": "LOW", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "180", "operator": ">=",
            "observed_value": "180", "expected_value": "180",
            "source_page": 4, "source_text": "Bid validity: 180 days.",
            "assessment": "Bid validity of 180 days confirmed in bid submission."
        },
        {
            "code": "GEN-002", "title": "Bid form signed by authorised signatory",
            "text": "All bid documents must be signed by an authorised signatory with power of attorney.",
            "category": "GENERAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "FAIL", "confidence": 82.0,
            "priority": "MEDIUM", "rule_type": "BOOLEAN",
            "observed_value": "Partial", "expected_value": "Yes",
            "source_page": 13, "source_text": "Signed by authorised signatory with power of attorney.",
            "assessment": "Bid documents are signed but power of attorney document was not submitted separately. Signatory authority unclear."
        },

        # ── Additional TECHNICAL FAIL ────────────
        {
            "code": "TECH-011", "title": "BIOS security: TPM 2.0 module",
            "text": "Desktop must include a Trusted Platform Module (TPM) 2.0 for hardware-level security.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "NOT_FOUND", "compliance_status": "MISSING", "confidence": 0.0,
            "priority": "HIGH", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Not Found", "expected_value": "Required",
            "source_page": 8, "source_text": "TPM 2.0 module for hardware security.",
            "assessment": "No explicit mention of TPM 2.0 found in Technical Compliance sheet."
        },
        {
            "code": "TECH-012", "title": "Display port output",
            "text": "Desktop must have at least one DisplayPort or HDMI output.",
            "category": "TECHNICAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "PASS", "confidence": 89.0,
            "priority": "LOW", "rule_type": "BOOLEAN",
            "observed_value": "Yes", "expected_value": "Yes",
            "source_page": 8, "source_text": "DisplayPort or HDMI output.",
            "assessment": "Both DisplayPort and HDMI outputs confirmed in Technical Compliance."
        },

        # ── Additional COMMERCIAL FAIL ───────────
        {
            "code": "COM-005", "title": "Make in India compliance",
            "text": "Product must meet Make in India criteria with minimum 50% local content.",
            "category": "COMMERCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "FAIL", "confidence": 88.0,
            "priority": "HIGH", "rule_type": "NUMERIC_MINIMUM",
            "threshold": "50", "operator": ">=",
            "observed_value": "35", "expected_value": "50",
            "source_page": 12, "source_text": "Make in India: minimum 50% local content.",
            "assessment": "Self-certification declares 35% local content, below the required 50% threshold."
        },

        # ── Additional STATUTORY REVIEW_REQUIRED ─
        {
            "code": "STAT-006", "title": "MSME registration",
            "text": "If applicable, bidder must submit valid MSME/Udyam registration certificate.",
            "category": "STATUTORY", "mandatory": False,
            "evidence_status": "PARTIAL", "compliance_status": "REVIEW_REQUIRED", "confidence": 65.0,
            "priority": "MEDIUM", "rule_type": "DOCUMENT_PRESENT",
            "observed_value": "Partial", "expected_value": "If applicable",
            "source_page": 9, "source_text": "MSME/Udyam registration if applicable.",
            "assessment": "Company Profile mentions MSME registration but the Udyam certificate was not separately included."
        },

        # ── Additional COMMERCIAL FAIL ───────────
        {
            "code": "COM-006", "title": "Price reasonableness within estimated value",
            "text": "Total bid price must be within the estimated tender value of ₹48.50 lakh.",
            "category": "COMMERCIAL", "mandatory": True,
            "evidence_status": "FOUND", "compliance_status": "FAIL", "confidence": 95.0,
            "priority": "HIGH", "rule_type": "NUMERIC_MAXIMUM",
            "threshold": "48.50", "operator": "<=",
            "observed_value": "52.30", "expected_value": "48.50",
            "source_page": 4, "source_text": "Estimated value: ₹48,50,000.",
            "assessment": "Total bid price of ₹52.30 lakh exceeds the estimated tender value of ₹48.50 lakh by ₹3.80 lakh."
        },
    ]


def _get_evidence_data() -> list[dict]:
    """Evidence mappings linking requirements to documents."""
    return [
        # ELIGIBILITY
        {"req_code": "ELIG-001", "document_name": "Company Profile.pdf", "page_number": 2,
         "source_text": "TechNova Solutions Pvt. Ltd., incorporated under the Companies Act, 2013. CIN: U62090JH2022PTC018765.",
         "extracted_value": "Registered Company", "confidence": 95.0, "evidence_status": "FOUND",
         "assessment": "Company registration certificate confirmed with valid CIN."},
        {"req_code": "ELIG-002", "document_name": "Company Profile.pdf", "page_number": 3,
         "source_text": "Established in 2020 with over 5 years of experience in IT hardware supply.",
         "extracted_value": "5 years", "confidence": 92.0, "evidence_status": "FOUND",
         "assessment": "5 years of relevant experience documented."},
        {"req_code": "ELIG-003", "document_name": "Experience Certificates.pdf", "page_number": 4,
         "source_text": "Contract 1: Ministry of Education, 200 desktops, ₹32.5 lakh (2023). Contract 2: State IT Dept, 150 desktops, ₹24.8 lakh (2024).",
         "extracted_value": "2 verified contracts", "confidence": 68.0, "evidence_status": "PARTIAL",
         "assessment": "Two completed contracts are clearly verified. A third contract could not be conclusively verified."},
        {"req_code": "ELIG-004", "document_name": "Declarations.pdf", "page_number": 3,
         "source_text": "We hereby declare that our firm has not been blacklisted or debarred by any government entity.",
         "extracted_value": "Not blacklisted", "confidence": 90.0, "evidence_status": "FOUND",
         "assessment": "Self-declaration of non-blacklisting verified."},
        {"req_code": "ELIG-005", "document_name": "Declarations.pdf", "page_number": 2,
         "source_text": "GSTIN: 20AABCT1234F1ZV, Status: Active.",
         "extracted_value": "20AABCT1234F1ZV", "confidence": 97.0, "evidence_status": "FOUND",
         "assessment": "Valid GST registration confirmed."},
        {"req_code": "ELIG-006", "document_name": "Company Profile.pdf", "page_number": 2,
         "source_text": "PAN: AABCT1234F.",
         "extracted_value": "AABCT1234F", "confidence": 98.0, "evidence_status": "FOUND",
         "assessment": "Valid PAN verified."},
        {"req_code": "ELIG-007", "document_name": "Company Profile.pdf", "page_number": 5,
         "source_text": "GeM Seller registered since 2021.",
         "extracted_value": "GeM registered", "confidence": 88.0, "evidence_status": "FOUND",
         "assessment": "GeM registration confirmed."},

        # FINANCIAL
        {"req_code": "FIN-001", "document_name": "Financial Statement.pdf", "page_number": 6,
         "source_text": "Average annual turnover for last 3 FYs: FY2023-24: ₹68.4L, FY2024-25: ₹72.1L, FY2025-26: ₹82.1L. Average: ₹74.2 lakh.",
         "extracted_value": "₹74.2 lakh", "confidence": 96.0, "evidence_status": "FOUND",
         "assessment": "Average annual turnover of ₹74.2 lakh exceeds the minimum requirement of ₹50 lakh."},
        {"req_code": "FIN-002", "document_name": "Financial Statement.pdf", "page_number": 8,
         "source_text": "Net worth as on 31.03.2026: ₹1,24,50,000 (Positive).",
         "extracted_value": "₹1.24 crore (Positive)", "confidence": 94.0, "evidence_status": "FOUND",
         "assessment": "Positive net worth confirmed."},
        {"req_code": "FIN-003", "document_name": "Financial Statement.pdf", "page_number": 2,
         "source_text": "EMD: Bank Guarantee No. BG/2026/45678, Amount: ₹97,000.",
         "extracted_value": "₹97,000", "confidence": 93.0, "evidence_status": "FOUND",
         "assessment": "EMD of ₹97,000 submitted."},
        {"req_code": "FIN-004", "document_name": "Declarations.pdf", "page_number": 4,
         "source_text": "We declare that there are no overdue statutory liabilities.",
         "extracted_value": "No overdue liabilities", "confidence": 85.0, "evidence_status": "FOUND",
         "assessment": "Declaration submitted."},
        {"req_code": "FIN-006", "document_name": "Declarations.pdf", "page_number": 5,
         "source_text": "We undertake to furnish performance security of 5% of contract value.",
         "extracted_value": "5% undertaking", "confidence": 91.0, "evidence_status": "FOUND",
         "assessment": "Performance security undertaking submitted."},

        # TECHNICAL
        {"req_code": "TECH-001", "document_name": "Technical Compliance.pdf", "page_number": 3,
         "source_text": "Processor: Intel Core i5-12400 (6 cores, 12 threads).",
         "extracted_value": "Intel Core i5-12400", "confidence": 94.0, "evidence_status": "FOUND",
         "assessment": "Processor specification meets the requirement."},
        {"req_code": "TECH-002", "document_name": "Technical Compliance.pdf", "page_number": 3,
         "source_text": "RAM: 16 GB DDR4 3200 MHz, expandable to 64 GB.",
         "extracted_value": "16 GB DDR4", "confidence": 95.0, "evidence_status": "FOUND",
         "assessment": "RAM specification meets the requirement."},
        {"req_code": "TECH-003", "document_name": "Technical Compliance.pdf", "page_number": 4,
         "source_text": "Storage: 512 GB NVMe M.2 SSD.",
         "extracted_value": "512 GB NVMe SSD", "confidence": 96.0, "evidence_status": "FOUND",
         "assessment": "Storage meets the minimum requirement."},
        {"req_code": "TECH-004", "document_name": "Technical Compliance.pdf", "page_number": 3,
         "source_text": "Processor base clock: 2.2 GHz, turbo boost up to 4.4 GHz.",
         "extracted_value": "2.2 GHz", "confidence": 97.0, "evidence_status": "FOUND",
         "assessment": "Base clock of 2.2 GHz is below the required 2.5 GHz threshold. Note: turbo boost reaches 4.4 GHz but base clock is the specified metric."},
        {"req_code": "TECH-005", "document_name": "Technical Compliance.pdf", "page_number": 5,
         "source_text": "Monitor: 23.8 inch IPS FHD (1920x1080), anti-glare.",
         "extracted_value": "23.8 inch FHD", "confidence": 93.0, "evidence_status": "FOUND",
         "assessment": "Monitor exceeds minimum size requirement."},
        {"req_code": "TECH-006", "document_name": "Technical Compliance.pdf", "page_number": 4,
         "source_text": "Networking: Integrated Gigabit Ethernet 10/100/1000 Mbps.",
         "extracted_value": "Gigabit LAN", "confidence": 91.0, "evidence_status": "FOUND",
         "assessment": "Gigabit Ethernet confirmed."},
        {"req_code": "TECH-007", "document_name": "Technical Compliance.pdf", "page_number": 4,
         "source_text": "USB Ports: 4x USB 3.0 (rear), 4x USB 2.0 (2 front, 2 rear). Total: 8.",
         "extracted_value": "8 USB ports", "confidence": 90.0, "evidence_status": "FOUND",
         "assessment": "8 USB ports exceed minimum 6 requirement."},
        {"req_code": "TECH-008", "document_name": "Technical Compliance.pdf", "page_number": 5,
         "source_text": "OS: Windows 11 Professional 64-bit, OEM license.",
         "extracted_value": "Windows 11 Pro", "confidence": 92.0, "evidence_status": "FOUND",
         "assessment": "Valid OS license confirmed."},
        {"req_code": "TECH-009", "document_name": "Technical Compliance.pdf", "page_number": 5,
         "source_text": "Peripherals: Wired USB keyboard, USB optical mouse.",
         "extracted_value": "Wired keyboard and mouse", "confidence": 88.0, "evidence_status": "FOUND",
         "assessment": "Standard peripherals included."},
        {"req_code": "TECH-010", "document_name": "Technical Compliance.pdf", "page_number": 6,
         "source_text": "PSU: 80 PLUS Bronze certified, 260W.",
         "extracted_value": "80 PLUS Bronze", "confidence": 72.0, "evidence_status": "PARTIAL",
         "assessment": "80 PLUS Bronze efficiency mentioned but explicit Energy Star label not documented."},
        {"req_code": "TECH-012", "document_name": "Technical Compliance.pdf", "page_number": 4,
         "source_text": "Display outputs: 1x DisplayPort 1.4, 1x HDMI 2.0.",
         "extracted_value": "DisplayPort + HDMI", "confidence": 89.0, "evidence_status": "FOUND",
         "assessment": "Display outputs confirmed."},

        # STATUTORY
        {"req_code": "STAT-001", "document_name": "OEM Authorisation.pdf", "page_number": 2,
         "source_text": "BIS Registration No: R-41234567.",
         "extracted_value": "BIS certified", "confidence": 89.0, "evidence_status": "FOUND",
         "assessment": "BIS certification confirmed."},
        {"req_code": "STAT-002", "document_name": "OEM Authorisation.pdf", "page_number": 2,
         "source_text": "RoHS compliance declaration: All products comply with EU RoHS directive.",
         "extracted_value": "RoHS compliant", "confidence": 87.0, "evidence_status": "FOUND",
         "assessment": "RoHS compliance confirmed."},
        {"req_code": "STAT-004", "document_name": "Financial Statement.pdf", "page_number": 15,
         "source_text": "ITR filed for AY 2023-24, 2024-25, 2025-26. Acknowledgement numbers attached.",
         "extracted_value": "3 years ITR", "confidence": 91.0, "evidence_status": "FOUND",
         "assessment": "Income tax returns for 3 years confirmed."},
        {"req_code": "STAT-005", "document_name": "Declarations.pdf", "page_number": 4,
         "source_text": "We comply with Minimum Wages Act, EPF Act, and ESI Act.",
         "extracted_value": "Labour law compliant", "confidence": 84.0, "evidence_status": "FOUND",
         "assessment": "Self-declaration of compliance submitted."},

        # DOCUMENT
        {"req_code": "DOC-001", "document_name": "Company Profile.pdf", "page_number": 1,
         "source_text": "Company Profile — TechNova Solutions Pvt. Ltd.",
         "extracted_value": "Document present", "confidence": 95.0, "evidence_status": "FOUND",
         "assessment": "Company Profile document submitted."},
        {"req_code": "DOC-002", "document_name": "Financial Statement.pdf", "page_number": 1,
         "source_text": "Audited Financial Statements — FY 2023-24, 2024-25, 2025-26.",
         "extracted_value": "Document present", "confidence": 94.0, "evidence_status": "FOUND",
         "assessment": "Audited financial statements submitted."},
        {"req_code": "DOC-003", "document_name": "Technical Compliance.pdf", "page_number": 1,
         "source_text": "Technical Compliance Sheet — as per Annexure-V.",
         "extracted_value": "Document present", "confidence": 93.0, "evidence_status": "FOUND",
         "assessment": "Technical Compliance sheet submitted."},
        {"req_code": "DOC-004", "document_name": "OEM Authorisation.pdf", "page_number": 1,
         "source_text": "OEM Authorisation Certificate from Dell Technologies.",
         "extracted_value": "Document present", "confidence": 90.0, "evidence_status": "FOUND",
         "assessment": "OEM Authorisation letter submitted."},
        {"req_code": "DOC-005", "document_name": "Declarations.pdf", "page_number": 1,
         "source_text": "Declarations and Undertakings — TechNova Solutions.",
         "extracted_value": "Document present", "confidence": 92.0, "evidence_status": "FOUND",
         "assessment": "Signed declarations submitted."},

        # COMMERCIAL
        {"req_code": "COM-001", "document_name": "Technical Compliance.pdf", "page_number": 10,
         "source_text": "Warranty: 3 years comprehensive onsite warranty.",
         "extracted_value": "3 years", "confidence": 91.0, "evidence_status": "FOUND",
         "assessment": "3-year warranty confirmed."},
        {"req_code": "COM-002", "document_name": "Technical Compliance.pdf", "page_number": 12,
         "source_text": "Proposed delivery timeline: 60 days from date of purchase order.",
         "extracted_value": "60 days", "confidence": 94.0, "evidence_status": "FOUND",
         "assessment": "Delivery timeline of 60 days exceeds the required 45 days."},
        {"req_code": "COM-003", "document_name": "Declarations.pdf", "page_number": 5,
         "source_text": "We accept payment terms: 100% after delivery, inspection and acceptance.",
         "extracted_value": "Accepted", "confidence": 89.0, "evidence_status": "FOUND",
         "assessment": "Payment terms accepted."},
        {"req_code": "COM-004", "document_name": "Declarations.pdf", "page_number": 5,
         "source_text": "We accept LD clause at 0.5% per week, subject to maximum cap of 5%.",
         "extracted_value": "Partial acceptance (5% cap)", "confidence": 74.0, "evidence_status": "PARTIAL",
         "assessment": "Bidder proposes 5% cap instead of 10%. Requires review."},
        {"req_code": "COM-005", "document_name": "Technical Compliance.pdf", "page_number": 14,
         "source_text": "Make in India self-certification: Local content 35%.",
         "extracted_value": "35%", "confidence": 88.0, "evidence_status": "FOUND",
         "assessment": "35% local content below required 50%."},
        {"req_code": "COM-006", "document_name": "Technical Compliance.pdf", "page_number": 15,
         "source_text": "Total bid price: ₹52,30,000 (inclusive of all taxes).",
         "extracted_value": "₹52.30 lakh", "confidence": 95.0, "evidence_status": "FOUND",
         "assessment": "Bid price of ₹52.30 lakh exceeds estimated value of ₹48.50 lakh."},

        # EXPERIENCE
        {"req_code": "EXP-001", "document_name": "Experience Certificates.pdf", "page_number": 2,
         "source_text": "Supply to Ministry of Education (2023) and State IT Department (2024).",
         "extracted_value": "Government experience", "confidence": 88.0, "evidence_status": "FOUND",
         "assessment": "Government supply experience confirmed."},
        {"req_code": "EXP-002", "document_name": "Experience Certificates.pdf", "page_number": 3,
         "source_text": "Largest single contract: Ministry of Education, 200 desktops, value ₹32.5 lakh.",
         "extracted_value": "₹32.5 lakh", "confidence": 93.0, "evidence_status": "FOUND",
         "assessment": "₹32.5 lakh single contract exceeds ₹20 lakh requirement."},

        # GENERAL
        {"req_code": "GEN-001", "document_name": "Declarations.pdf", "page_number": 1,
         "source_text": "Bid validity: 180 days from bid opening date.",
         "extracted_value": "180 days", "confidence": 90.0, "evidence_status": "FOUND",
         "assessment": "Bid validity meets requirement."},
        {"req_code": "GEN-002", "document_name": "Declarations.pdf", "page_number": 6,
         "source_text": "Signed by: Rajesh Kumar, Director. Power of attorney not attached separately.",
         "extracted_value": "Signed, PoA missing", "confidence": 82.0, "evidence_status": "FOUND",
         "assessment": "Documents signed but PoA not submitted separately."},

        # STAT-006
        {"req_code": "STAT-006", "document_name": "Company Profile.pdf", "page_number": 6,
         "source_text": "Registered as MSME under Udyam Registration. Certificate reference mentioned.",
         "extracted_value": "Referenced but not attached", "confidence": 65.0, "evidence_status": "PARTIAL",
         "assessment": "MSME registration mentioned but certificate not separately attached."},
    ]


def _get_verification_data() -> list[dict]:
    """Verification results for all requirements."""
    return [
        # ELIGIBILITY
        {"req_code": "ELIG-001", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Legal registration == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 95.0, "explanation": "Company is legally registered with valid CIN."},
        {"req_code": "ELIG-002", "observed_value": "5", "expected_value": "3", "operator": ">=",
         "rule": "Experience years >= 3", "calculation": "5 >= 3", "result": "PASS",
         "confidence": 92.0, "explanation": "5 years of experience exceeds the 3-year minimum."},
        {"req_code": "ELIG-003", "observed_value": "2", "expected_value": "3", "operator": ">=",
         "rule": "Similar contracts >= 3", "calculation": "2 >= 3", "result": "REVIEW_REQUIRED",
         "confidence": 68.0, "explanation": "Only 2 of 3 required contracts conclusively verified. Third contract reference exists but documentation is insufficient."},
        {"req_code": "ELIG-004", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Not blacklisted == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 90.0, "explanation": "Self-declaration of non-blacklisting verified."},
        {"req_code": "ELIG-005", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Valid GST == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 97.0, "explanation": "Valid GST registration confirmed."},
        {"req_code": "ELIG-006", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Valid PAN == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 98.0, "explanation": "Valid PAN confirmed."},
        {"req_code": "ELIG-007", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "GeM registered == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 88.0, "explanation": "GeM portal registration confirmed."},

        # FINANCIAL
        {"req_code": "FIN-001", "observed_value": "74.2", "expected_value": "50", "operator": ">=",
         "rule": "Avg turnover >= ₹50 lakh", "calculation": "74.2 >= 50", "result": "PASS",
         "confidence": 96.0, "explanation": "Average annual turnover of ₹74.2 lakh exceeds the minimum ₹50 lakh."},
        {"req_code": "FIN-002", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Positive net worth == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 94.0, "explanation": "Positive net worth of ₹1.24 crore confirmed."},
        {"req_code": "FIN-003", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "EMD submitted == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 93.0, "explanation": "EMD of ₹97,000 submitted via bank guarantee."},
        {"req_code": "FIN-004", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "No overdue liabilities == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 85.0, "explanation": "Declaration of no overdue statutory liabilities submitted."},
        {"req_code": "FIN-005", "observed_value": None, "expected_value": "Required", "operator": None,
         "rule": "Solvency certificate present", "calculation": "Document not found", "result": "MISSING",
         "confidence": 0.0, "explanation": "Solvency certificate was not submitted."},
        {"req_code": "FIN-006", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Performance security undertaking == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 91.0, "explanation": "Performance security undertaking submitted."},

        # TECHNICAL
        {"req_code": "TECH-001", "observed_value": "Intel Core i5-12400", "expected_value": "Intel Core i5 12th Gen or equivalent", "operator": "==",
         "rule": "Processor meets specification", "calculation": "i5-12400 matches i5 12th Gen", "result": "PASS",
         "confidence": 94.0, "explanation": "Intel Core i5-12400 meets the specification."},
        {"req_code": "TECH-002", "observed_value": "16", "expected_value": "16", "operator": ">=",
         "rule": "RAM >= 16 GB", "calculation": "16 >= 16", "result": "PASS",
         "confidence": 95.0, "explanation": "16 GB RAM meets the minimum requirement."},
        {"req_code": "TECH-003", "observed_value": "512", "expected_value": "512", "operator": ">=",
         "rule": "SSD >= 512 GB", "calculation": "512 >= 512", "result": "PASS",
         "confidence": 96.0, "explanation": "512 GB NVMe SSD meets the requirement."},
        {"req_code": "TECH-004", "observed_value": "2.2", "expected_value": "2.5", "operator": ">=",
         "rule": "Base clock >= 2.5 GHz", "calculation": "2.2 >= 2.5", "result": "FAIL",
         "confidence": 97.0, "explanation": "Base clock speed of 2.2 GHz is below the required 2.5 GHz. While turbo boost reaches 4.4 GHz, the tender specifies base clock."},
        {"req_code": "TECH-005", "observed_value": "23.8", "expected_value": "21.5", "operator": ">=",
         "rule": "Monitor >= 21.5 inches", "calculation": "23.8 >= 21.5", "result": "PASS",
         "confidence": 93.0, "explanation": "23.8 inch monitor exceeds minimum 21.5 inches."},
        {"req_code": "TECH-006", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Gigabit LAN == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 91.0, "explanation": "Gigabit Ethernet confirmed."},
        {"req_code": "TECH-007", "observed_value": "8", "expected_value": "6", "operator": ">=",
         "rule": "USB ports >= 6", "calculation": "8 >= 6", "result": "PASS",
         "confidence": 90.0, "explanation": "8 USB ports exceed minimum 6."},
        {"req_code": "TECH-008", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Windows 11 Pro == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 92.0, "explanation": "Windows 11 Professional OEM license included."},
        {"req_code": "TECH-009", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Wired peripherals == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 88.0, "explanation": "Standard wired keyboard and mouse included."},
        {"req_code": "TECH-010", "observed_value": "Partial", "expected_value": "Yes", "operator": "==",
         "rule": "Energy Star rated == Yes", "calculation": "'Partial' != 'Yes'", "result": "REVIEW_REQUIRED",
         "confidence": 72.0, "explanation": "80 PLUS Bronze certification present but explicit Energy Star label not confirmed."},
        {"req_code": "TECH-011", "observed_value": None, "expected_value": "Required", "operator": None,
         "rule": "TPM 2.0 present", "calculation": "Not found in documentation", "result": "MISSING",
         "confidence": 0.0, "explanation": "TPM 2.0 specification not found in Technical Compliance."},
        {"req_code": "TECH-012", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Display output == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 89.0, "explanation": "DisplayPort and HDMI outputs confirmed."},

        # STATUTORY
        {"req_code": "STAT-001", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "BIS certified == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 89.0, "explanation": "BIS certification confirmed."},
        {"req_code": "STAT-002", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "RoHS compliant == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 87.0, "explanation": "RoHS compliance confirmed."},
        {"req_code": "STAT-003", "observed_value": None, "expected_value": "Required", "operator": None,
         "rule": "EPR registration present", "calculation": "Document not found", "result": "MISSING",
         "confidence": 0.0, "explanation": "EPR registration certificate was not submitted."},
        {"req_code": "STAT-004", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "ITR 3 years == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 91.0, "explanation": "ITR for 3 years submitted."},
        {"req_code": "STAT-005", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Labour law compliant == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 84.0, "explanation": "Self-declaration of compliance submitted."},
        {"req_code": "STAT-006", "observed_value": "Partial", "expected_value": "If applicable", "operator": "==",
         "rule": "MSME certificate present", "calculation": "Referenced but not attached", "result": "REVIEW_REQUIRED",
         "confidence": 65.0, "explanation": "MSME registration mentioned but Udyam certificate not separately included."},

        # DOCUMENT
        {"req_code": "DOC-001", "observed_value": "Found", "expected_value": "Required", "operator": None,
         "rule": "Company Profile present", "calculation": "Document found", "result": "PASS",
         "confidence": 95.0, "explanation": "Company Profile document submitted."},
        {"req_code": "DOC-002", "observed_value": "Found", "expected_value": "Required", "operator": None,
         "rule": "Financial statements present", "calculation": "Document found", "result": "PASS",
         "confidence": 94.0, "explanation": "Financial statements submitted."},
        {"req_code": "DOC-003", "observed_value": "Found", "expected_value": "Required", "operator": None,
         "rule": "Technical compliance sheet present", "calculation": "Document found", "result": "PASS",
         "confidence": 93.0, "explanation": "Technical Compliance sheet submitted."},
        {"req_code": "DOC-004", "observed_value": "Found", "expected_value": "Required", "operator": None,
         "rule": "OEM authorisation present", "calculation": "Document found", "result": "PASS",
         "confidence": 90.0, "explanation": "OEM Authorisation letter submitted."},
        {"req_code": "DOC-005", "observed_value": "Found", "expected_value": "Required", "operator": None,
         "rule": "Declarations present", "calculation": "Document found", "result": "PASS",
         "confidence": 92.0, "explanation": "Signed declarations submitted."},
        {"req_code": "DOC-006", "observed_value": None, "expected_value": "Required", "operator": None,
         "rule": "ISO 9001:2015 certificate present", "calculation": "Document not found", "result": "MISSING",
         "confidence": 0.0, "explanation": "ISO 9001:2015 certificate was not found in any submitted document."},

        # COMMERCIAL
        {"req_code": "COM-001", "observed_value": "3", "expected_value": "3", "operator": ">=",
         "rule": "Warranty >= 3 years", "calculation": "3 >= 3", "result": "PASS",
         "confidence": 91.0, "explanation": "3-year comprehensive warranty offered."},
        {"req_code": "COM-002", "observed_value": "60", "expected_value": "45", "operator": "<=",
         "rule": "Delivery <= 45 days", "calculation": "60 <= 45", "result": "FAIL",
         "confidence": 94.0, "explanation": "Proposed 60-day delivery exceeds the maximum 45-day requirement."},
        {"req_code": "COM-003", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Payment terms accepted == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 89.0, "explanation": "Payment terms accepted."},
        {"req_code": "COM-004", "observed_value": "Partial", "expected_value": "Yes", "operator": "==",
         "rule": "LD clause accepted == Yes", "calculation": "'Partial' != 'Yes'", "result": "REVIEW_REQUIRED",
         "confidence": 74.0, "explanation": "Bidder proposed 5% cap instead of 10%. Deviation from tender terms."},
        {"req_code": "COM-005", "observed_value": "35", "expected_value": "50", "operator": ">=",
         "rule": "Local content >= 50%", "calculation": "35 >= 50", "result": "FAIL",
         "confidence": 88.0, "explanation": "35% local content below required 50%."},
        {"req_code": "COM-006", "observed_value": "52.30", "expected_value": "48.50", "operator": "<=",
         "rule": "Bid price <= ₹48.50 lakh", "calculation": "52.30 <= 48.50", "result": "FAIL",
         "confidence": 95.0, "explanation": "Bid price ₹52.30 lakh exceeds estimated value ₹48.50 lakh."},

        # EXPERIENCE
        {"req_code": "EXP-001", "observed_value": "Yes", "expected_value": "Yes", "operator": "==",
         "rule": "Govt supply experience == Yes", "calculation": "'Yes' == 'Yes'", "result": "PASS",
         "confidence": 88.0, "explanation": "Government supply experience confirmed."},
        {"req_code": "EXP-002", "observed_value": "32.5", "expected_value": "20", "operator": ">=",
         "rule": "Single contract >= ₹20 lakh", "calculation": "32.5 >= 20", "result": "PASS",
         "confidence": 93.0, "explanation": "₹32.5 lakh exceeds ₹20 lakh minimum."},

        # GENERAL
        {"req_code": "GEN-001", "observed_value": "180", "expected_value": "180", "operator": ">=",
         "rule": "Bid validity >= 180 days", "calculation": "180 >= 180", "result": "PASS",
         "confidence": 90.0, "explanation": "Bid validity of 180 days meets the requirement."},
        {"req_code": "GEN-002", "observed_value": "Partial", "expected_value": "Yes", "operator": "==",
         "rule": "Authorised signatory with PoA == Yes", "calculation": "'Partial' != 'Yes'", "result": "FAIL",
         "confidence": 82.0, "explanation": "Documents signed but Power of Attorney not submitted."},
    ]


def _get_risk_data() -> list[dict]:
    """Risk assessments — 5 HIGH, 4 MEDIUM, 2 LOW (for non-pass items)."""
    return [
        # HIGH (5)
        {"req_code": "ELIG-003", "priority": "HIGH",
         "risk_factor": "Insufficient contract evidence",
         "impact": "Bidder may not meet minimum experience threshold, risking contract delivery capability.",
         "recommendation": "Request additional documentation for the third contract. Verify with issuing authority."},
        {"req_code": "TECH-004", "priority": "HIGH",
         "risk_factor": "Below-spec processor clock speed",
         "impact": "Equipment may not meet performance requirements for intended workloads.",
         "recommendation": "Reject unless bidder provides updated specification meeting 2.5 GHz minimum."},
        {"req_code": "DOC-006", "priority": "HIGH",
         "risk_factor": "Missing quality certification",
         "impact": "Cannot verify quality management standards compliance.",
         "recommendation": "Request ISO 9001:2015 certificate from bidder or OEM."},
        {"req_code": "STAT-003", "priority": "HIGH",
         "risk_factor": "Missing EPR registration",
         "impact": "Non-compliance with e-waste management regulations.",
         "recommendation": "Request valid CPCB EPR registration certificate."},
        {"req_code": "COM-006", "priority": "HIGH",
         "risk_factor": "Bid price exceeds estimated value",
         "impact": "Budget overrun of ₹3.80 lakh. May require additional financial approval.",
         "recommendation": "Negotiate price or seek budget revision approval from competent authority."},

        # MEDIUM (4)
        {"req_code": "FIN-005", "priority": "MEDIUM",
         "risk_factor": "Missing solvency certificate",
         "impact": "Cannot independently verify financial solvency beyond balance sheet.",
         "recommendation": "Request solvency certificate if considered essential for this tender value."},
        {"req_code": "TECH-010", "priority": "MEDIUM",
         "risk_factor": "Uncertain energy certification",
         "impact": "May not meet energy efficiency standards for government procurement.",
         "recommendation": "Request explicit Energy Star certification documentation."},
        {"req_code": "COM-004", "priority": "MEDIUM",
         "risk_factor": "Modified LD clause terms",
         "impact": "Reduced penalty exposure may affect delivery incentives.",
         "recommendation": "Negotiate LD cap to match tender requirement of 10% or accept deviation."},
        {"req_code": "STAT-006", "priority": "MEDIUM",
         "risk_factor": "Missing MSME certificate",
         "impact": "Cannot verify MSME status for applicable benefits or preferences.",
         "recommendation": "Request Udyam Registration certificate if MSME benefits are claimed."},

        # LOW (2)
        {"req_code": "COM-002", "priority": "LOW",
         "risk_factor": "Extended delivery timeline",
         "impact": "15-day delay beyond allowed period. LD clause would apply.",
         "recommendation": "Negotiate delivery timeline or apply liquidated damages as per contract."},
        {"req_code": "GEN-002", "priority": "LOW",
         "risk_factor": "Missing Power of Attorney",
         "impact": "Signatory authority may be questioned during contract execution.",
         "recommendation": "Request Power of Attorney document for the signatory."},
    ]


# Backward compatibility — old seed function name
def seed_demo_tender(db: Session):
    """Backward-compatible seed function."""
    return seed_demo_data(db)
