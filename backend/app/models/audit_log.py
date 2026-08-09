from __future__ import annotations

import uuid
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import AuditResult

if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    actor_email: Mapped[str | None] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    resource_type: Mapped[str | None] = mapped_column(String(128), index=True)
    resource_id: Mapped[str | None] = mapped_column(String(128), index=True)
    result: Mapped[str] = mapped_column(String(32), default=AuditResult.SUCCESS, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    meta: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    user: Mapped["User | None"] = relationship(lazy="joined")