"""Password hashing, JWT issuance/validation and credential encryption."""

from __future__ import annotations

import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt
from cryptography.fernet import Fernet, InvalidToken
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

TokenType = Literal["access", "refresh"]


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(plain_password, password_hash)
    except ValueError:
        return False


def create_token(subject: str, token_type: TokenType = "access", **claims: Any) -> str:
    expires_minutes = (
        settings.access_token_expire_minutes
        if token_type == "access"
        else settings.refresh_token_expire_minutes
    )
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
        **claims,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    """Decode a JWT. Raises jwt.PyJWTError on any problem."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def _fernet() -> Fernet:
    key = settings.credential_encryption_key
    if key:
        return Fernet(key.encode() if isinstance(key, str) else key)
    # Deterministic development fallback derived from the JWT secret so local
    # setups work without extra configuration. Production must set a real key.
    digest = hashlib.sha256(settings.jwt_secret.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_secret(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt_secret(value: str) -> str:
    try:
        return _fernet().decrypt(value.encode()).decode()
    except InvalidToken as exc:  # pragma: no cover - configuration error
        raise ValueError("Stored credential could not be decrypted with the configured key") from exc