from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import JobStatus

if TYPE_CHECKING:
    from app.models.report import Report
    from app.models.report_template import ReportTemplate
    from app.models.screenshot import Screenshot
    from app.models.user import User


class ReportJob(UUIDMixin, TimestampMixin, Base):
    """A long-running background report generation job."""

    __tablename__ = "report_jobs"

    name: Mapped[str] = mapped_column(String(512), nullable=False)
    template_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("report_templates.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    requested_by_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    status: Mapped[str] = mapped_column(String(32), default=JobStatus.QUEUED, nullable=False, index=True)
    current_stage: Mapped[str | None] = mapped_column(String(64))
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_item: Mapped[str | None] = mapped_column(String(512))
    completed_items: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_items: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_items: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    customer_codes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    collection_plan: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    stage_history: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    celery_task_id: Mapped[str | None] = mapped_column(String(255), index=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    error_code: Mapped[str | None] = mapped_column(String(64))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    template: Mapped["ReportTemplate"] = relationship(lazy="joined")
    requested_by: Mapped["User | None"] = relationship(lazy="joined")
    screenshots: Mapped[list["Screenshot"]] = relationship(
        back_populates="job", cascade="all, delete-orphan", lazy="selectin"
    )
    report: Mapped["Report | None"] = relationship(back_populates="job", uselist=False)