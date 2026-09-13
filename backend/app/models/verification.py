from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    requirement_id: Mapped[int] = mapped_column(
        ForeignKey("requirements.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    observed_value: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    expected_value: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    operator: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    rule: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    calculation: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    result: Mapped[str] = mapped_column(
        String(50),
        default="REVIEW_REQUIRED",
        nullable=False
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    explanation: Mapped[str | None] = mapped_column(
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
        back_populates="verification"
    )
