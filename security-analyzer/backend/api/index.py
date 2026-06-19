import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Security Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Late imports (after path is set)
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
    return {"status": "ok", "version": "1.0.0"}
