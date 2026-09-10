from fastapi import APIRouter
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine

router = APIRouter(tags=["System"])

@router.get("/database")
async def database_status():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "database": settings.database_url.split(":")[0]
        }
    except Exception as error:
        return {
            "status": "error",
            "database": "unavailable",
            "detail": str(error)
        }