from __future__ import annotations

import uuid
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import ReportFrequency

if TYPE_CHECKING:
    from app.models.report_section import ReportSection
    from app.models.user import User


class ReportTemplate(UUIDMixin, TimestampMixin, Base):
    """Defines WHAT a report requires. Report structure is never hard-coded."""

    __tablename__ = "report_templates"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    report_type: Mapped[str] = mapped_column(String(128), nullable=False)
    frequency: Mapped[str] = mapped_column(String(32), default=ReportFrequency.MONTHLY, nullable=False)
    description: Mapped[str | None] = mapped_column(String(1024))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Customer scope: list of customer codes, or empty for "all customers".
    customer_codes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    # Default graph types when a section does not override them.
    default_graph_types: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    # Free-form rendering options (header text, footer text, css theme, etc).
    options: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    created_by: Mapped["User | None"] = relationship(lazy="joined")
    sections: Mapped[list["ReportSection"]] = relationship(
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="ReportSection.order_index",
        lazy="selectin",
    )