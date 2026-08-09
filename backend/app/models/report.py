from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import ReportStatus

if TYPE_CHECKING:
    from app.models.report_job import ReportJob
    from app.models.report_template import ReportTemplate
    from app.models.user import User


class Report(UUIDMixin, TimestampMixin, Base):
    """A completed report stored in the archive."""

    __tablename__ = "reports"

    name: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    report_type: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    frequency: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    period_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)

    job_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("report_jobs.id", ondelete="SET NULL"), unique=True
    )
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("report_templates.id", ondelete="SET NULL")
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    status: Mapped[str] = mapped_column(String(32), default=ReportStatus.GENERATED, nullable=False, index=True)
    customer_codes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    html_path: Mapped[str | None] = mapped_column(String(1024))
    pdf_path: Mapped[str | None] = mapped_column(String(1024))
    # Structured, editable report content (sections, statistics, observations).
    content: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    contains_generated_content: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    job: Mapped["ReportJob | None"] = relationship(back_populates="report")
    template: Mapped["ReportTemplate | None"] = relationship(lazy="joined")
    created_by: Mapped["User | None"] = relationship(foreign_keys=[created_by_id], lazy="joined")
    approved_by: Mapped["User | None"] = relationship(foreign_keys=[approved_by_id], lazy="joined")