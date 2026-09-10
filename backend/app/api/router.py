from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.system import router as system_router
from app.api.routes.auth import router as auth_router
from app.api.routes.tenders import router as tender_router
from app.api.routes.documents import router as document_router
from app.api.routes.requirements import router as requirement_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(system_router)
api_router.include_router(auth_router)
api_router.include_router(tender_router)
api_router.include_router(document_router)
api_router.include_router(requirement_router)