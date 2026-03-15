from uuid import UUID

from fastapi import Header
from fastapi import HTTPException
from fastapi import status


def get_current_user_id(x_user_id: str | None = Header(default=None)) -> str:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "X-User-Id header is required",
                    "details": None,
                }
            },
        )

    try:
        UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": {
                    "code": "INVALID_USER_ID",
                    "message": "X-User-Id must be a valid UUID",
                    "details": None,
                }
            },
        )

    return x_user_id
