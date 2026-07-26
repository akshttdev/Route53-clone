from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    hosted_zone_id: Mapped[int] = mapped_column(
        ForeignKey("hosted_zones.id", ondelete="CASCADE"),
        nullable=False,
    )

    type: Mapped[str] = mapped_column(String(10), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    value: Mapped[str] = mapped_column(String(1000), nullable=False)

    ttl: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=300,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    hosted_zone = relationship(
        "HostedZone",
        back_populates="records",
    )
