from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    tender_id: Mapped[int] = mapped_column(
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    requirement_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    requirement_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    mandatory: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    threshold: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    operator: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    source_document: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    source_page: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    source_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    evidence_status: Mapped[str] = mapped_column(
        String(50),
        default="NOT_FOUND",
        nullable=False
    )

    compliance_status: Mapped[str] = mapped_column(
        String(50),
        default="REVIEW_REQUIRED",
        nullable=False
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="LOW",
        nullable=False
    )

    rule_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    observed_value: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    expected_value: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
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

    tender = relationship(
        "Tender",
        back_populates="requirements"
    )

    evidence_records = relationship(
        "Evidence",
        back_populates="requirement",
        cascade="all, delete-orphan"
    )

    verification = relationship(
        "VerificationResult",
        back_populates="requirement",
        uselist=False,
        cascade="all, delete-orphan"
    )

    review_decision = relationship(
        "ReviewDecision",
        back_populates="requirement",
        uselist=False,
        cascade="all, delete-orphan"
    )
