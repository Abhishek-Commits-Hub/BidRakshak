from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )

    user: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    entity: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    entity_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    metadata_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
