from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    requirement_id: Mapped[int] = mapped_column(
        ForeignKey("requirements.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    document_id: Mapped[int | None] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True
    )

    document_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    source_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    extracted_value: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    evidence_status: Mapped[str] = mapped_column(
        String(50),
        default="NOT_FOUND",
        nullable=False
    )

    assessment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    requirement = relationship(
        "Requirement",
        back_populates="evidence_records"
    )

    document = relationship(
        "Document",
        back_populates="evidence_records"
    )
