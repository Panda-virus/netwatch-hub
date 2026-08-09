"""SQLAlchemy models. Importing this package registers every table on Base."""

from app.models.audit_log import AuditLog
from app.models.credential import Credential
from app.models.customer import Customer
from app.models.device import Device
from app.models.infrastructure_file import InfrastructureFile
from app.models.interface import Interface
from app.models.link import Link
from app.models.monitoring_platform import MonitoringPlatform
from app.models.report import Report
from app.models.report_job import ReportJob
from app.models.report_section import ReportSection
from app.models.report_template import ReportTemplate
from app.models.role import Role
from app.models.screenshot import Screenshot
from app.models.service import Service
from app.models.user import User

__all__ = [
    "AuditLog",
    "Credential",
    "Customer",
    "Device",
    "InfrastructureFile",
    "Interface",
    "Link",
    "MonitoringPlatform",
    "Report",
    "ReportJob",
    "ReportSection",
    "ReportTemplate",
    "Role",
    "Screenshot",
    "Service",
    "User",
]