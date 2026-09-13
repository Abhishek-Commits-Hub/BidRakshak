from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

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

    original_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    officer_decision: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    reviewed_by: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    requirement = relationship(
        "Requirement",
        back_populates="review_decision"
    )
