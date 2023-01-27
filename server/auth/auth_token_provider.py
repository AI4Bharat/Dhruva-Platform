# from typing import Optional
# from fastapi import Depends, HTTPException
# from fastapi.security import HTTPBasic, HTTPBasicCredentials, APIKeyHeader


# class AuthTokenProvider():
#     def __init__(self, credentials: Optional[str] = Depends(APIKeyHeader(name="authorization"))) -> None:
#         if not credentials:
#             raise HTTPException(
#                 # status_code=status., detail="Not authenticated"
#             )
