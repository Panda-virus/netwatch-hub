from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import ScreenshotStatus

if TYPE_CHECKING:
    from app.models.report_job import ReportJob


class Screenshot(UUIDMixin, TimestampMixin, Base):
    """Metadata for a captured graph image. Binary data lives on disk."""

    __tablename__ = "screenshots"

    job_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("report_jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )

    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL")
    )
    link_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("links.id", ondelete="SET NULL"))
    device_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("devices.id", ondelete="SET NULL")
    )
    interface_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("interfaces.id", ondelete="SET NULL")
    )
    platform_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("monitoring_platforms.id", ondelete="SET NULL")
    )

    # Denormalised identifiers so report rendering and validation never depend
    # on rows that may later be re-imported.
    customer_code: Mapped[str | None] = mapped_column(String(64), index=True)
    customer_name: Mapped[str | None] = mapped_column(String(255))
    link_name: Mapped[str | None] = mapped_column(String(255))
    device_name: Mapped[str | None] = mapped_column(String(255))
    interface_name: Mapped[str | None] = mapped_column(String(128))
    platform_name: Mapped[str | None] = mapped_column(String(255))
    graph_type: Mapped[str] = mapped_column(String(64), nullable=False)
    graph_title: Mapped[str | None] = mapped_column(String(512))

    period_start: Mapped[date | None] = mapped_column(Date)
    period_end: Mapped[date | None] = mapped_column(Date)
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    file_path: Mapped[str | None] = mapped_column(String(1024))
    file_name: Mapped[str | None] = mapped_column(String(512))
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)

    status: Mapped[str] = mapped_column(String(32), default=ScreenshotStatus.PENDING, nullable=False, index=True)
    validation_notes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    failure_reason: Mapped[str | None] = mapped_column(Text)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_manual_upload: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    page_metadata: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    extracted_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    job: Mapped["ReportJob"] = relationship(back_populates="screenshots")