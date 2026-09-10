from fastapi import APIRouter

from app.core.config import settings


router = APIRouter(tags=["System"])


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version
    }


@router.get("/ready")
async def readiness_check():
    return {
        "status": "ready",
        "service": settings.app_name
    }


@router.get("/version")
async def version():
    return {
        "name": settings.app_name,
        "version": settings.app_version
    }