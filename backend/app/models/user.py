from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.role import Role


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    role_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)

    role: Mapped["Role"] = relationship(back_populates="users", lazy="joined")

    @property
    def permissions(self) -> list[str]:
        return list(self.role.permissions or [])

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.email}>"