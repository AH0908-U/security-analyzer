from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Security Analyzer"
    version: str = "1.0.0"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./security_analyzer.db"
    redis_url: str = "redis://localhost:6379/0"
    
    phishtank_api_key: Optional[str] = None
    virustotal_api_key: Optional[str] = None
    hibp_api_key: Optional[str] = None
    google_safe_browsing_api_key: Optional[str] = None
    
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    frontend_url: str = "http://localhost:3000"
    
    max_request_size: int = 1_048_576
    rate_limit: str = "60/minute"
    
    class Config:
        env_file = ".env"

settings = Settings()
