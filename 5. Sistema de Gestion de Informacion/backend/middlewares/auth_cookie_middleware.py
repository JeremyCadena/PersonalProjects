# banana-env/middlewares/auth_cookie_middleware.py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class AuthCookieMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = request.cookies.get("access_token_cookie")
        if token:
            request.headers.__dict__["_list"].append(
                (b"authorization", f"Bearer {token}".encode("latin-1"))
            )
        
        response = await call_next(request) 

        return response