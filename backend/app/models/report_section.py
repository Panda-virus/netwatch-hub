from __future__ import annotations

import uuid
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.report_template import ReportTemplate


class ReportSection(UUIDMixin, TimestampMixin, Base):
    """An ordered requirement block inside a template."""

    __tablename__ = "report_sections"

    template_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("report_templates.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # e.g. executive_summary | customer_graphs | statistics | text | recommendations
    section_type: Mapped[str] = mapped_column(String(64), nullable=False)
    body_text: Mapped[str | None] = mapped_column(Text)

    # Requirement definition: which customers, which graphs, which statistics.
    customer_codes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    graph_types: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    required_statistics: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    requires_screenshots: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    requires_ai_observations: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    options: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    template: Mapped["ReportTemplate"] = relationship(back_populates="sections")