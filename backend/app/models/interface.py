from __future__ import annotations

import uuid
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.device import Device
    from app.models.link import Link
    from app.models.monitoring_platform import MonitoringPlatform


class Interface(UUIDMixin, TimestampMixin, Base):
    """A device interface. This is the level at which graphs are captured."""

    __tablename__ = "interfaces"
    __table_args__ = (UniqueConstraint("device_id", "name", name="uq_interface_device_name"),)

    device_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    link_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("links.id", ondelete="SET NULL"), index=True
    )
    monitoring_platform_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("monitoring_platforms.id", ondelete="SET NULL")
    )

    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(512))
    ip_address: Mapped[str | None] = mapped_column(String(64))
    speed_mbps: Mapped[int | None] = mapped_column()
    # Platform-specific hints resolved by the automation adapters
    # (e.g. {"solarwinds": {"node_id": "...", "interface_id": "..."}}).
    graph_refs: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    device: Mapped["Device"] = relationship(back_populates="interfaces")
    link: Mapped["Link | None"] = relationship(back_populates="interfaces")
    monitoring_platform: Mapped["MonitoringPlatform | None"] = relationship(back_populates="interfaces")