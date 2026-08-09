"""Application configuration.

Every value is sourced from the environment. No secrets are hard-coded.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    app_name: str = "MTL ANPMRS Backend"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api"

    # Database
    database_url: str = "postgresql+psycopg://anpmrs:anpmrs@localhost:5432/anpmrs"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Security
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 7
    credential_encryption_key: str | None = None

    # CORS
    frontend_url: str = "http://localhost:3000"
    extra_cors_origins: str = ""

    # Storage
    storage_path: Path = Path("./storage")
    max_upload_size_mb: int = 25
    allowed_upload_extensions: tuple[str, ...] = (".xlsx", ".xls", ".xlsm")

    # Browser automation
    monitoring_mode: str = Field(default="mock", description="mock | live")
    playwright_browser_path: str | None = None
    playwright_headless: bool = True
    browser_navigation_timeout_ms: int = 30_000
    browser_graph_render_wait_ms: int = 2_500

    # OCR
    ocr_enabled: bool = False
    tesseract_cmd: str | None = None

    # AI abstraction
    ai_provider: str = "none"
    ai_api_key: str | None = None
    ai_base_url: str | None = None
    ai_model: str | None = None

    # Seed data
    seed_admin_email: str = "admin@mtl.mw"
    seed_admin_password: str = "ChangeMe123!"
    seed_engineer_email: str = "engineer@mtl.mw"
    seed_engineer_password: str = "ChangeMe123!"

    @field_validator("monitoring_mode")
    @classmethod
    def _validate_mode(cls, value: str) -> str:
        if value not in {"mock", "live"}:
            raise ValueError("MONITORING_MODE must be 'mock' or 'live'")
        return value

    @property
    def cors_origins(self) -> list[str]:
        origins = [self.frontend_url]
        origins += [o.strip() for o in self.extra_cors_origins.split(",") if o.strip()]
        # Preserve order, drop duplicates.
        return list(dict.fromkeys(origins))

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def uploads_dir(self) -> Path:
        return self.storage_path / "uploads"

    @property
    def screenshots_dir(self) -> Path:
        return self.storage_path / "screenshots"

    @property
    def reports_dir(self) -> Path:
        return self.storage_path / "reports"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()