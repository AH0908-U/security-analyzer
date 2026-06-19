from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from config import settings
from database import init_db
import os

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

if os.getenv("VERCEL"):
    app.docs_url = None
    app.redoc_url = None

allowed_origins = [
    settings.frontend_url,
    "http://localhost:3000",
    "https://frontend-lime-ten-63peql6dba.vercel.app",
    "https://frontend-5f3qsettw-lovhatim27-7722s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

import re
PRIVATE_IPS = re.compile(r"(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^0\.)|(^169\.254\.)")

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

import ipaddress

from routes.scan import router as scan_router
from routes.monitor import router as monitor_router
from routes.remediation import router as remediation_router
from routes.simulation import router as simulation_router

app.include_router(scan_router, prefix="/api", tags=["Scan"])
app.include_router(monitor_router, prefix="/api", tags=["Monitoring"])
app.include_router(remediation_router, prefix="/api", tags=["Remediation"])
app.include_router(simulation_router, prefix="/api", tags=["Simulation"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.version}
