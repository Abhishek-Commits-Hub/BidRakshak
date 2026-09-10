from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tender_id: Mapped[int] = mapped_column(
        ForeignKey("tenders.id"),
        nullable=False,
        index=True
    )
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id"),
        nullable=False,
        index=True
    )
    requirement_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    canonical_text: Mapped[str | None] = mapped_column(
        Text
    )
    mandatory: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    evidence_required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    metric: Mapped[str | None] = mapped_column(
        String(100)
    )
    operator: Mapped[str | None] = mapped_column(
        String(20)
    )
    threshold_value: Mapped[float | None] = mapped_column(
        Float
    )
    unit: Mapped[str | None] = mapped_column(
        String(50)
    )
    source_page: Mapped[int | None] = mapped_column(
        nullable=True
    )
    source_clause: Mapped[str | None] = mapped_column(
        String(255)
    )
    severity: Mapped[str] = mapped_column(
        String(20),
        default="MEDIUM",
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="EXTRACTED",
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
