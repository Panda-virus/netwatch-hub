from __future__ import annotations

import uuid
from typing import Any, TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin
from app.models.enums import ImportStatus

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.user import User


class InfrastructureFile(UUIDMixin, TimestampMixin, Base):
    """An uploaded infrastructure workbook plus its detected column mapping."""

    __tablename__ = "infrastructure_files"

    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    stored_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(255))
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    checksum: Mapped[str | None] = mapped_column(String(128), index=True)

    status: Mapped[str] = mapped_column(String(32), default=ImportStatus.UPLOADED, nullable=False)
    sheet_names: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    selected_sheet: Mapped[str | None] = mapped_column(String(255))
    detected_columns: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    column_mapping: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    invalid_rows: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    error_message: Mapped[str | None] = mapped_column(String(1024))

    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    uploaded_by: Mapped["User | None"] = relationship(lazy="joined")
    customers: Mapped[list["Customer"]] = relationship(back_populates="source_file")