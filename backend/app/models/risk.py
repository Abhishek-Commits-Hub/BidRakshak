from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

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

    priority: Mapped[str] = mapped_column(
        String(20),
        default="LOW",
        nullable=False
    )

    risk_factor: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    impact: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    recommendation: Mapped[str | None] = mapped_column(
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
        backref="risk_assessment"
    )
