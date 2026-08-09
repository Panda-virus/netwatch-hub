from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import CredentialKind

if TYPE_CHECKING:
    from app.models.monitoring_platform import MonitoringPlatform


class Credential(UUIDMixin, TimestampMixin, Base):
    """Monitoring platform credential. Secret material is encrypted at rest and
    never returned through the API."""

    __tablename__ = "credentials"

    platform_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("monitoring_platforms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(32), default=CredentialKind.BROWSER, nullable=False)
    label: Mapped[str] = mapped_column(String(255), default="Automation account", nullable=False)
    username: Mapped[str | None] = mapped_column(String(255))
    encrypted_password: Mapped[str | None] = mapped_column(String(2048))
    encrypted_api_token: Mapped[str | None] = mapped_column(String(4096))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(512))

    platform: Mapped["MonitoringPlatform"] = relationship(back_populates="credentials")

    @property
    def has_password(self) -> bool:
        return bool(self.encrypted_password)

    @property
    def has_api_token(self) -> bool:
        return bool(self.encrypted_api_token)