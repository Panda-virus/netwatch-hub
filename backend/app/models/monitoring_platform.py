from __future__ import annotations

from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import PlatformKind

if TYPE_CHECKING:
    from app.models.credential import Credential
    from app.models.device import Device
    from app.models.interface import Interface


class MonitoringPlatform(UUIDMixin, TimestampMixin, Base):
    """A configured external monitoring platform (SolarWinds, Observium, mock).

    Navigation rules and selectors live in ``adapter_config`` so the automation
    layer can be retargeted without code changes.
    """

    __tablename__ = "monitoring_platforms"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(32), default=PlatformKind.MOCK, nullable=False)
    base_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    description: Mapped[str | None] = mapped_column(String(512))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    use_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Configurable selectors / paths / timeouts consumed by the adapters.
    adapter_config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    credentials: Mapped[list["Credential"]] = relationship(
        back_populates="platform", cascade="all, delete-orphan", lazy="selectin"
    )
    devices: Mapped[list["Device"]] = relationship(back_populates="monitoring_platform")
    interfaces: Mapped[list["Interface"]] = relationship(back_populates="monitoring_platform")