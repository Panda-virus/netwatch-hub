from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.infrastructure_file import InfrastructureFile
    from app.models.service import Service


class Customer(UUIDMixin, TimestampMixin, Base):
    """A reporting customer, e.g. "NB" (National Bank)."""

    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    region: Mapped[str | None] = mapped_column(String(128))
    account_manager: Mapped[str | None] = mapped_column(String(255))
    source_file_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("infrastructure_files.id", ondelete="SET NULL")
    )

    services: Mapped[list["Service"]] = relationship(
        back_populates="customer", cascade="all, delete-orphan", lazy="selectin"
    )
    source_file: Mapped["InfrastructureFile | None"] = relationship(back_populates="customers")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Customer {self.code}>"