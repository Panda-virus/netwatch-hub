# MTL ANPMRS Backend (reporting automation engine)

FastAPI + PostgreSQL + Redis/Celery + Playwright + WeasyPrint backend for the
MTL Infrastructure Report Platform. It is a **reporting automation layer** over
existing monitoring platforms — it performs no independent network monitoring,
SNMP polling, topology discovery or alerting.

```
Infrastructure Excel + Report Template
  -> customer/infrastructure mapping -> required graphs
  -> authenticate & navigate SolarWinds/Observium (Playwright)
  -> capture + validate screenshots -> observations
  -> populate template -> HTML -> PDF
```

This backend runs **outside** Lovable hosting (Lovable's runtime is serverless
edge and cannot execute Python, Celery workers, Playwright or WeasyPrint). Run
it with Docker Compose and point the frontend at it via its API base URL.

## Run

```bash
cd backend
cp .env.example .env      # set JWT_SECRET and CREDENTIAL_ENCRYPTION_KEY
docker compose up --build
# API docs: http://localhost:8000/docs
```

## Implemented in this pass (Phase 1 foundation)

- `app/core/config.py` — fully env-driven settings (DB, Redis, JWT, storage,
  browser, OCR, AI provider abstraction, CORS). No hard-coded secrets.
- `app/core/database.py` — SQLAlchemy 2.0 engine, session factory, UUID/timestamp
  mixins, `get_db` dependency and worker `session_scope`.
- `app/core/security.py` — Argon2 password hashing, JWT access/refresh tokens,
  Fernet encryption/decryption for monitoring credentials.
- `app/core/logging.py` — structlog JSON logging with automatic redaction of any
  password/secret/token field.
- `app/core/errors.py` — domain exception hierarchy plus handlers emitting the
  frontend error contract `{ success, message, error_code }` (includes
  `INVALID_EXCEL`, `GRAPH_NOT_FOUND`, `SCREENSHOT_FAILED`,
  `PDF_GENERATION_FAILED`, `MONITORING_AUTH_FAILED`, …).
- `app/models/*` — full relational schema: Role, User, Customer → Service → Link
  → Device → Interface → MonitoringPlatform (+ per-platform `graph_refs`),
  InfrastructureFile (stored path, detected columns, configurable column mapping,
  import summary, invalid rows), Credential (encrypted at rest),
  ReportTemplate/ReportSection (requirements live in data, never in code),
  ReportJob (status, stage, progress, current item, counts, collection plan),
  Screenshot (full metadata + validation status, files on disk), Report (HTML/PDF
  paths, editable structured content, approval), AuditLog.
- `app/models/enums.py` — roles and permission matrix (NOC Engineer / Supervisor /
  Administrator), job statuses, the exact stage list with progress percentages,
  screenshot statuses, graph types and audit actions.
- Docker Compose (backend, worker, postgres, redis), Dockerfile with Chromium,
  Cairo/Pango for WeasyPrint and Tesseract, plus `.env.example` and pinned
  `requirements.txt`.

## Remaining phases (not yet written)

2. Excel upload/parsing + infrastructure APIs (`services/excel_service.py`,
   `infrastructure_service.py`, `mapping_service.py`, `api/infrastructure.py`).
3. Template APIs and requirement extraction (`services/template_service.py`).
4. Celery app + report job orchestration and progress polling endpoint.
5. Monitoring abstraction `BaseMonitoringPlatform` + mock SolarWinds/Observium
   adapters (mock first; no invented real URLs or selectors).
6. Playwright `browser_manager.py` and live adapters driven by
   `MonitoringPlatform.adapter_config` selectors.
7. Jinja2 → HTML → WeasyPrint PDF report engine, preview/download endpoints.
8. Analysis: statistics, optional OCR, `ai_service.py` provider abstraction with
   generated content flagged and editable.
9. Auth/users/monitoring/screenshots/settings/audit routers wired into
   `app/main.py` with CORS for `FRONTEND_URL`.
10. Alembic migrations, seed data (admin, engineer, sample customers, mock
    platform, sample template) and pytest suite with mock monitoring adapters.

Continue in that order; each phase should keep `alembic upgrade head`, `/docs`
and the test suite green.