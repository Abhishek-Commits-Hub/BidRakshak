from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.session import get_db
from app.models.bidder import Bidder
from app.models.document import Document
from app.models.tender import Tender
from app.models.user import User
from app.schemas.tender import (
    DocumentResponse,
    TenderCreate,
    TenderDetailResponse,
    TenderResponse
)

router = APIRouter(
    prefix="/api/tenders",
    tags=["Tenders"]
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.get(
    "",
    response_model=list[TenderResponse]
)
def list_tenders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Tender)
        .order_by(Tender.created_at.desc())
        .all()
    )


@router.post(
    "",
    response_model=TenderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_tender(
    request: TenderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_tender = (
        db.query(Tender)
        .filter(Tender.tender_number == request.tender_number)
        .first()
    )

    if existing_tender:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A tender with this tender number already exists."
        )

    tender = Tender(
        tender_number=request.tender_number,
        title=request.title,
        organization=request.organization,
        description=request.description,
        status=request.status
    )

    db.add(tender)
    db.commit()
    db.refresh(tender)

    return tender


@router.get(
    "/{tender_number}",
    response_model=TenderDetailResponse
)
def get_tender(
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

    return tender


@router.get(
    "/{tender_number}/documents",
    response_model=list[DocumentResponse]
)
def list_documents(
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

    return (
        db.query(Document)
        .filter(Document.tender_id == tender.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


@router.post(
    "/{tender_number}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_document(
    tender_number: str,
    file: UploadFile = File(...),
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

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid file is required."
        )

    allowed_extensions = {
        ".pdf",
        ".doc",
        ".docx"
    }

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC and DOCX files are supported."
        )

    tender_directory = UPLOAD_DIR / str(tender.id)
    tender_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    safe_filename = Path(file.filename).name
    destination = tender_directory / safe_filename

    contents = await file.read()
    destination.write_bytes(contents)

    document = Document(
        tender_id=tender.id,
        document_name=safe_filename,
        document_type="BID_DOCUMENT",
        file_path=str(destination),
        page_count=0
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

