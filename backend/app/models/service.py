from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.link import Link


class Service(UUIDMixin, TimestampMixin, Base):
    """A service purchased by a customer, e.g. "NB Internet Service"."""

    __tablename__ = "services"
    __table_args__ = (UniqueConstraint("customer_id", "name", name="uq_service_customer_name"),)

    customer_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    service_type: Mapped[str | None] = mapped_column(String(128))

    customer: Mapped["Customer"] = relationship(back_populates="services")
    links: Mapped[list["Link"]] = relationship(
        back_populates="service", cascade="all, delete-orphan", lazy="selectin"
    )