from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Tender(Base):
    __tablename__ = "tenders"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    tender_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    organization: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="ACTIVE",
        nullable=False
    )

    department: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    tender_id_display: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    tender_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    bid_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    estimated_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    emd_amount: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    bid_validity_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    delivery_period_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    contract_period_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    procurement_method: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    analysis_status: Mapped[str] = mapped_column(
        String(50),
        default="NOT_STARTED",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    bidder = relationship(
        "Bidder",
        back_populates="tender",
        uselist=False,
        cascade="all, delete-orphan"
    )

    documents = relationship(
        "Document",
        back_populates="tender",
        cascade="all, delete-orphan"
    )

    requirements = relationship(
        "Requirement",
        back_populates="tender",
        cascade="all, delete-orphan"
    )
