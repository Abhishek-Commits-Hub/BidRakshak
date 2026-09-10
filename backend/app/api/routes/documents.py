from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document, DocumentPage
from app.models.organization import Organization
from app.models.tender import Tender
from app.models.user import User
from app.schemas.document import DocumentPageResponse, DocumentResponse
from app.security.auth import get_current_user
from app.documents.extractor import extract_pdf_pages

router = APIRouter(
    prefix="/tenders",
    tags=["Documents"]
)

UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads"

@router.post(
    "/{tender_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_document(
    tender_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    organization = db.query(Organization).filter(
        Organization.slug == f"user-{current_user.id}"
    ).first()

    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )

    tender = db.query(Tender).filter(
        Tender.id == tender_id,
        Tender.organization_id == organization.id
    ).first()

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    tender_directory = UPLOAD_ROOT / f"tender-{tender_id}"
    tender_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    safe_filename = Path(file.filename).name
    file_path = tender_directory / safe_filename

    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF exceeds the 25 MB upload limit"
        )

    file_path.write_bytes(content)

    try:
        page_count, pages = extract_pdf_pages(str(file_path))
    except Exception as error:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=f"PDF processing failed: {error}"
        )

    document = Document(
        tender_id=tender_id,
        filename=safe_filename,
        file_path=str(file_path),
        document_type="TENDER",
        status="PROCESSED",
        page_count=page_count
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    for page in pages:
        db.add(
            DocumentPage(
                document_id=document.id,
                page_number=page["page_number"],
                text=page["text"]
            )
        )

    db.commit()

    return document

@router.get(
    "/{tender_id}/documents",
    response_model=list[DocumentResponse]
)
def list_documents(
    tender_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    organization = db.query(Organization).filter(
        Organization.slug == f"user-{current_user.id}"
    ).first()

    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )

    tender = db.query(Tender).filter(
        Tender.id == tender_id,
        Tender.organization_id == organization.id
    ).first()

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    return db.query(Document).filter(
        Document.tender_id == tender_id
    ).order_by(
        Document.created_at.desc()
    ).all()

@router.get(
    "/documents/{document_id}",
    response_model=DocumentResponse
)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    tender = db.query(Tender).filter(
        Tender.id == document.tender_id
    ).first()

    organization = db.query(Organization).filter(
        Organization.id == tender.organization_id
    ).first()

    if not organization or organization.slug != f"user-{current_user.id}":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return document

@router.get(
    "/documents/{document_id}/pages",
    response_model=list[DocumentPageResponse]
)
def get_document_pages(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    tender = db.query(Tender).filter(
        Tender.id == document.tender_id
    ).first()

    organization = db.query(Organization).filter(
        Organization.id == tender.organization_id
    ).first()

    if not organization or organization.slug != f"user-{current_user.id}":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return db.query(DocumentPage).filter(
        DocumentPage.document_id == document_id
    ).order_by(
        DocumentPage.page_number
    ).all()