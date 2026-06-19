from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from config import settings
from database import init_db
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
import ipaddress

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [
    settings.frontend_url,
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    if not settings.debug:
        response.headers["Content-Security-Policy"] = "default-src 'none'; script-src 'self'; connect-src 'self'"
    return response

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > settings.max_request_size:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request too large"}
                )
        except ValueError:
            pass
    return await call_next(request)

PRIVATE_IPS = re.compile(r"(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^0\.)|(^169\.254\.)|(^\[::1\])|(^\[f[cd])")

def validate_url_target(url: str):
    if PRIVATE_IPS.match(url):
        raise ValueError("Internal URLs are not allowed")
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if parsed.hostname:
        try:
            ip = ipaddress.ip_address(parsed.hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                raise ValueError("Internal IP addresses are not allowed")
        except ValueError:
            pass
    return url

from api.scan import router as scan_router
from api.monitor import router as monitor_router
from api.remediation import router as remediation_router
from api.simulation import router as simulation_router

app.include_router(scan_router, prefix="/api", tags=["Scan"])
app.include_router(monitor_router, prefix="/api", tags=["Monitoring"])
app.include_router(remediation_router, prefix="/api", tags=["Remediation"])
app.include_router(simulation_router, prefix="/api", tags=["Simulation"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.version}
