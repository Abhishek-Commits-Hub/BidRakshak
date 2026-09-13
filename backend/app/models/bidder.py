from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Bidder(Base):
    __tablename__ = "bidders"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    tender_id: Mapped[int] = mapped_column(
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    registration_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    tender = relationship(
        "Tender",
        back_populates="bidder"
    )
