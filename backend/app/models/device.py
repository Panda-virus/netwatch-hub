from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.interface import Interface
    from app.models.monitoring_platform import MonitoringPlatform


class Device(UUIDMixin, TimestampMixin, Base):
    """A network device referenced by the infrastructure workbook, e.g. BT-RTR-01."""

    __tablename__ = "devices"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hostname: Mapped[str | None] = mapped_column(String(255))
    ip_address: Mapped[str | None] = mapped_column(String(64), index=True)
    device_type: Mapped[str | None] = mapped_column(String(128))
    region: Mapped[str | None] = mapped_column(String(128), index=True)
    site: Mapped[str | None] = mapped_column(String(255))
    monitoring_platform_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("monitoring_platforms.id", ondelete="SET NULL")
    )

    interfaces: Mapped[list["Interface"]] = relationship(
        back_populates="device", cascade="all, delete-orphan", lazy="selectin"
    )
    monitoring_platform: Mapped["MonitoringPlatform | None"] = relationship(back_populates="devices")