from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.interface import Interface
    from app.models.service import Service


class Link(UUIDMixin, TimestampMixin, Base):
    """A physical/logical link belonging to a service, e.g. "NB Blantyre Link"."""

    __tablename__ = "links"

    service_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    circuit_id: Mapped[str | None] = mapped_column(String(128), index=True)
    bandwidth_mbps: Mapped[int | None] = mapped_column(Integer)
    region: Mapped[str | None] = mapped_column(String(128))

    service: Mapped["Service"] = relationship(back_populates="links")
    interfaces: Mapped[list["Interface"]] = relationship(back_populates="link", lazy="selectin")