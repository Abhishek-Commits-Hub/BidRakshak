from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter(
    prefix="/api",
    tags=["System"]
)

@router.get(
    "/health",
    response_model=HealthResponse
)
def health_check(db: Session = Depends(get_db)):
    database_status = "ok"

    try:
        db.execute(text("SELECT 1"))
    except Exception:
        database_status = "error"

    return HealthResponse(
        status="online",
        service=settings.app_name,
        version=settings.app_version,
        database=database_status
    )