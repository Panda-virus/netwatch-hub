"""Domain exceptions and the JSON error contract shared with the frontend."""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)


class AppError(Exception):
    """Base application error rendered as a predictable JSON body."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    error_code: str = "APP_ERROR"

    def __init__(self, message: str, *, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    error_code = "CONFLICT"


class ValidationError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "VALIDATION_ERROR"


class AuthenticationError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "NOT_AUTHENTICATED"


class PermissionDeniedError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "PERMISSION_DENIED"


class InvalidExcelError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "INVALID_EXCEL"


class StorageError(AppError):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "STORAGE_ERROR"


class MonitoringPlatformError(AppError):
    status_code = status.HTTP_502_BAD_GATEWAY
    error_code = "MONITORING_PLATFORM_ERROR"


class MonitoringAuthenticationError(MonitoringPlatformError):
    error_code = "MONITORING_AUTH_FAILED"


class GraphNotFoundError(MonitoringPlatformError):
    error_code = "GRAPH_NOT_FOUND"


class ScreenshotCaptureError(MonitoringPlatformError):
    error_code = "SCREENSHOT_FAILED"


class ScreenshotValidationError(AppError):
    error_code = "SCREENSHOT_VALIDATION_FAILED"


class ReportGenerationError(AppError):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "REPORT_GENERATION_FAILED"


class PdfGenerationError(ReportGenerationError):
    error_code = "PDF_GENERATION_FAILED"


class AiServiceError(AppError):
    status_code = status.HTTP_502_BAD_GATEWAY
    error_code = "AI_SERVICE_ERROR"


def error_body(message: str, error_code: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    body: dict[str, Any] = {"success": False, "message": message, "error_code": error_code}
    if details:
        body["details"] = details
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(exc.message, exc.error_code, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_body("Request payload failed validation", "VALIDATION_ERROR", {"errors": exc.errors()}),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = {401: "NOT_AUTHENTICATED", 403: "PERMISSION_DENIED", 404: "NOT_FOUND"}.get(
            exc.status_code, "HTTP_ERROR"
        )
        return JSONResponse(status_code=exc.status_code, content=error_body(str(exc.detail), code))

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        logger.error("unhandled_exception", path=str(request.url.path), error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_body("An unexpected error occurred", "INTERNAL_ERROR"),
        )