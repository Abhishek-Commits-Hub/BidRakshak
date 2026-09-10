from datetime import datetime
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: int
    tender_id: int
    filename: str
    document_type: str
    status: str
    page_count: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class DocumentPageResponse(BaseModel):
    id: int
    document_id: int
    page_number: int
    text: str

    model_config = {
        "from_attributes": True
    }