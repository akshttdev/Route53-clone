from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    zone_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Public",
        server_default="Public",
    )

    vpc_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    vpc_region: Mapped[str | None] = mapped_column(String(64), nullable=True)

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    owner = relationship("User", back_populates="hosted_zones")

    records = relationship(
        "DNSRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
    )
