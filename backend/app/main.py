from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analysis import router as analysis_router
from app.api.audit import router as audit_router
from app.api.auth import router as auth_router
from app.api.evidence import router as evidence_router
from app.api.health import router as health_router
from app.api.report import router as report_router
from app.api.requirements import router as requirements_router
from app.api.review import router as review_router
from app.api.risk import router as risk_router
from app.api.tenders import router as tender_router
from app.api.verification import router as verification_router
from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.demo.seed import seed_demo_data

# Import all models so Base.metadata.create_all picks them up
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

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_demo_data(db)
finally:
    db.close()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-assisted bid compliance verification platform for GeM procurement."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(tender_router)
app.include_router(requirements_router)
app.include_router(evidence_router)
app.include_router(analysis_router)
app.include_router(verification_router)
app.include_router(review_router)
app.include_router(risk_router)
app.include_router(report_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "status": "online",
        "version": settings.app_version,
        "message": "BidRakshak API is running."
    }
