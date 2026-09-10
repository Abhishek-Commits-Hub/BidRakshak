from datetime import datetime
from pydantic import BaseModel, Field

class TenderCreate(BaseModel):
    reference_number: str = Field(min_length=2, max_length=255)
    title: str = Field(min_length=2, max_length=500)
    issuing_authority: str | None = None
    description: str | None = None

class TenderResponse(BaseModel):
    id: int
    organization_id: int
    reference_number: str
    title: str
    issuing_authority: str | None
    description: str | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }