from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(
            status_code=status_code,
            detail={
                "error": {
                    "code": code,
                    "message": message,
                    "details": None,
                }
            },
        )


class NotFoundError(AppError):
    def __init__(self, code: str, message: str):
        super().__init__(status.HTTP_404_NOT_FOUND, code, message)


class ConflictError(AppError):
    def __init__(self, code: str, message: str):
        super().__init__(status.HTTP_409_CONFLICT, code, message)


class ValidationError(AppError):
    def __init__(self, code: str, message: str):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, code, message)
