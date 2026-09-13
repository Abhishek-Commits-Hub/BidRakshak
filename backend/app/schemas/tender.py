from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BidderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    registration_number: str
    contact_email: str | None
    created_at: datetime


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_name: str
    document_type: str
    page_count: int
    status: str = "UPLOADED"
    uploaded_at: datetime


class TenderCreate(BaseModel):
    tender_number: str
    title: str
    organization: str
    description: str | None = None
    status: str = "ACTIVE"


class TenderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tender_number: str
    title: str
    organization: str
    description: str | None
    status: str
    department: str | None = None
    tender_id_display: str | None = None
    tender_type: str | None = None
    bid_type: str | None = None
    estimated_value: float | None = None
    emd_amount: float | None = None
    bid_validity_days: int | None = None
    delivery_period_days: int | None = None
    contract_period_months: int | None = None
    procurement_method: str | None = None
    analysis_status: str = "NOT_STARTED"
    created_at: datetime


class TenderDetailResponse(TenderResponse):
    bidder: BidderResponse | None = None
    documents: list[DocumentResponse] = []
