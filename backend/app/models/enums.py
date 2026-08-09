"""Enumerations shared by models, schemas and services."""

from __future__ import annotations

from enum import StrEnum


class RoleName(StrEnum):
    NOC_ENGINEER = "noc_engineer"
    NOC_SUPERVISOR = "noc_supervisor"
    ADMINISTRATOR = "administrator"


class Permission(StrEnum):
    INFRASTRUCTURE_UPLOAD = "infrastructure:upload"
    INFRASTRUCTURE_READ = "infrastructure:read"
    INFRASTRUCTURE_EDIT = "infrastructure:edit"
    REPORT_CREATE = "report:create"
    REPORT_READ = "report:read"
    REPORT_EDIT = "report:edit"
    REPORT_APPROVE = "report:approve"
    SCREENSHOT_READ = "screenshot:read"
    SCREENSHOT_MANAGE = "screenshot:manage"
    TEMPLATE_READ = "template:read"
    TEMPLATE_MANAGE = "template:manage"
    USER_MANAGE = "user:manage"
    ROLE_MANAGE = "role:manage"
    MONITORING_MANAGE = "monitoring:manage"
    SETTINGS_MANAGE = "settings:manage"
    AUDIT_READ = "audit:read"


ROLE_PERMISSIONS: dict[RoleName, list[Permission]] = {
    RoleName.NOC_ENGINEER: [
        Permission.INFRASTRUCTURE_UPLOAD,
        Permission.INFRASTRUCTURE_READ,
        Permission.INFRASTRUCTURE_EDIT,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_EDIT,
        Permission.SCREENSHOT_READ,
        Permission.SCREENSHOT_MANAGE,
        Permission.TEMPLATE_READ,
    ],
    RoleName.NOC_SUPERVISOR: [],  # populated below
    RoleName.ADMINISTRATOR: [],  # populated below
}

ROLE_PERMISSIONS[RoleName.NOC_SUPERVISOR] = [
    *ROLE_PERMISSIONS[RoleName.NOC_ENGINEER],
    Permission.REPORT_APPROVE,
    Permission.TEMPLATE_MANAGE,
]

ROLE_PERMISSIONS[RoleName.ADMINISTRATOR] = [
    *ROLE_PERMISSIONS[RoleName.NOC_SUPERVISOR],
    Permission.USER_MANAGE,
    Permission.ROLE_MANAGE,
    Permission.MONITORING_MANAGE,
    Permission.SETTINGS_MANAGE,
    Permission.AUDIT_READ,
]


class PlatformKind(StrEnum):
    SOLARWINDS = "solarwinds"
    OBSERVIUM = "observium"
    MOCK = "mock"


class CredentialKind(StrEnum):
    BROWSER = "browser"
    API = "api"


class ImportStatus(StrEnum):
    UPLOADED = "uploaded"
    MAPPED = "mapped"
    IMPORTED = "imported"
    FAILED = "failed"


class ReportFrequency(StrEnum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    AD_HOC = "ad_hoc"


class JobStatus(StrEnum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobStage(StrEnum):
    READING_TEMPLATE = "reading_template"
    READING_INFRASTRUCTURE = "reading_infrastructure"
    BUILDING_COLLECTION_PLAN = "building_collection_plan"
    CONNECTING_TO_MONITORING = "connecting_to_monitoring"
    CAPTURING_SCREENSHOTS = "capturing_screenshots"
    VALIDATING_SCREENSHOTS = "validating_screenshots"
    ANALYZING_DATA = "analyzing_data"
    BUILDING_REPORT = "building_report"
    GENERATING_HTML = "generating_html"
    GENERATING_PDF = "generating_pdf"
    COMPLETED = "completed"
    FAILED = "failed"


# Ordered stages with the progress percentage reported once the stage starts.
STAGE_PROGRESS: dict[JobStage, int] = {
    JobStage.READING_TEMPLATE: 3,
    JobStage.READING_INFRASTRUCTURE: 8,
    JobStage.BUILDING_COLLECTION_PLAN: 14,
    JobStage.CONNECTING_TO_MONITORING: 20,
    JobStage.CAPTURING_SCREENSHOTS: 30,
    JobStage.VALIDATING_SCREENSHOTS: 70,
    JobStage.ANALYZING_DATA: 78,
    JobStage.BUILDING_REPORT: 85,
    JobStage.GENERATING_HTML: 90,
    JobStage.GENERATING_PDF: 95,
    JobStage.COMPLETED: 100,
    JobStage.FAILED: 100,
}


class ScreenshotStatus(StrEnum):
    PENDING = "pending"
    CAPTURED = "captured"
    VALIDATED = "validated"
    FAILED = "failed"
    SKIPPED = "skipped"


class GraphType(StrEnum):
    TRAFFIC = "traffic"
    AVAILABILITY = "availability"
    LATENCY = "latency"
    ERRORS = "errors"
    UTILISATION = "utilisation"


class ReportStatus(StrEnum):
    DRAFT = "draft"
    GENERATED = "generated"
    APPROVED = "approved"
    ARCHIVED = "archived"


class AuditAction(StrEnum):
    USER_LOGIN = "user.login"
    USER_LOGIN_FAILED = "user.login_failed"
    USER_LOGOUT = "user.logout"
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    INFRASTRUCTURE_UPLOADED = "infrastructure.uploaded"
    INFRASTRUCTURE_IMPORTED = "infrastructure.imported"
    MAPPING_UPDATED = "infrastructure.mapping_updated"
    MONITORING_PLATFORM_SAVED = "monitoring.platform_saved"
    MONITORING_CREDENTIALS_CHANGED = "monitoring.credentials_changed"
    MONITORING_CONNECTION_TESTED = "monitoring.connection_tested"
    TEMPLATE_CREATED = "template.created"
    TEMPLATE_MODIFIED = "template.modified"
    TEMPLATE_DELETED = "template.deleted"
    REPORT_JOB_CREATED = "report.job_created"
    REPORT_STARTED = "report.started"
    REPORT_COMPLETED = "report.completed"
    REPORT_FAILED = "report.failed"
    REPORT_CANCELLED = "report.cancelled"
    REPORT_APPROVED = "report.approved"
    REPORT_DOWNLOADED = "report.downloaded"
    SCREENSHOT_CAPTURED = "screenshot.captured"
    SCREENSHOT_FAILED = "screenshot.failed"
    SCREENSHOT_MANUAL_UPLOAD = "screenshot.manual_upload"


class AuditResult(StrEnum):
    SUCCESS = "success"
    FAILURE = "failure"