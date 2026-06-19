from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional
import re
from urllib.parse import urlparse
from scanners.website_scanner import WebsiteScanner
from scanners.email_scanner import EmailScanner
from scanners.domain_scanner import DomainScanner
from scanners.breach_checker import BreachChecker
from scanners.threat_lookup import ThreatLookup
from reporting.score_calculator import ScoreCalculator
from reporting.fix_engine import FixEngine
from database import async_session
from models.scan import Scan

router = APIRouter()
score_calc = ScoreCalculator()
fix_engine = FixEngine()

PRIVATE_IPS = re.compile(r"(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^0\.)|(^169\.254\.)")

class ScanWebsiteRequest(BaseModel):
    url: str
    check_breaches: Optional[bool] = False

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError("Invalid URL format")
        if parsed.scheme not in ("http", "https"):
            raise ValueError("Only http/https URLs allowed")
        hostname = parsed.hostname or ""
        if PRIVATE_IPS.match(hostname):
            raise ValueError("Internal URLs are not allowed")
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "[::1]"):
            raise ValueError("Localhost URLs are not allowed")
        if len(v) > 2048:
            raise ValueError("URL too long")
        return v

class ScanEmailRequest(BaseModel):
    email_text: str
    sender_email: Optional[str] = None

    @field_validator("email_text")
    @classmethod
    def validate_email_length(cls, v: str) -> str:
        if len(v) > 1_000_000:
            raise ValueError("Email content too large")
        return v

class ScanDomainRequest(BaseModel):
    domain: str

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        if len(v) > 253:
            raise ValueError("Domain too long")
        if not re.match(r"^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid domain format")
        return v

class ScanResponse(BaseModel):
    scan_id: Optional[int] = None
    scan_type: str
    target: str
    overall_score: float
    risk_level: str
    findings_count: int
    findings: list
    severity_breakdown: dict
    top_improvements: list
    fixes: Optional[list] = None

@router.post("/scan/website", response_model=ScanResponse)
async def scan_website(req: ScanWebsiteRequest):
    scanner = WebsiteScanner()
    result = await scanner.scan(req.url)
    findings = result["findings"]
    score = score_calc.calculate(findings)

    fixes = fix_engine.get_all_fixes_for_findings(findings)
    for i, f in enumerate(findings):
        f["finding_type"] = f.get("category", "") + "_" + f.get("title", "").lower()[:30].replace(" ", "_")

    async with async_session() as session:
        scan = Scan(
            scan_type="website",
            target=req.url,
            overall_score=score["score"],
            risk_level=score["risk_level"],
            summary=score
        )
        session.add(scan)
        await session.commit()
        scan_id = scan.id

    return ScanResponse(
        scan_id=scan_id,
        scan_type="website",
        target=req.url,
        overall_score=score["score"],
        risk_level=score["risk_level"],
        findings_count=score["findings_count"],
        findings=findings,
        severity_breakdown=score["severity_breakdown"],
        top_improvements=score["top_improvements"],
        fixes=fixes
    )

@router.post("/scan/email", response_model=ScanResponse)
async def scan_email(req: ScanEmailRequest):
    scanner = EmailScanner()
    result = await scanner.scan(req.email_text)
    findings = result["findings"]
    score = score_calc.calculate(findings)

    for i, f in enumerate(findings):
        f["finding_type"] = f.get("category", "") + "_" + f.get("title", "").lower()[:30].replace(" ", "_")

    msg_preview = req.email_text[:100] + "..." if len(req.email_text) > 100 else req.email_text

    async with async_session() as session:
        scan_obj = Scan(
            scan_type="email",
            target=msg_preview,
            overall_score=score["score"],
            risk_level=score["risk_level"],
            summary=score
        )
        session.add(scan_obj)
        await session.commit()
        scan_id = scan_obj.id

    return ScanResponse(
        scan_id=scan_id,
        scan_type="email",
        target=msg_preview,
        overall_score=score["score"],
        risk_level=score["risk_level"],
        findings_count=score["findings_count"],
        findings=findings,
        severity_breakdown=score["severity_breakdown"],
        top_improvements=score["top_improvements"]
    )

@router.post("/scan/domain", response_model=ScanResponse)
async def scan_domain(req: ScanDomainRequest):
    scanner = DomainScanner()
    result = await scanner.scan(req.domain)
    findings = result["findings"]
    score = score_calc.calculate(findings)

    for i, f in enumerate(findings):
        f["finding_type"] = f.get("category", "") + "_" + f.get("title", "").lower()[:30].replace(" ", "_")

    async with async_session() as session:
        scan_obj = Scan(
            scan_type="domain",
            target=req.domain,
            overall_score=score["score"],
            risk_level=score["risk_level"],
            summary=score
        )
        session.add(scan_obj)
        await session.commit()
        scan_id = scan_obj.id

    return ScanResponse(
        scan_id=scan_id,
        scan_type="domain",
        target=req.domain,
        overall_score=score["score"],
        risk_level=score["risk_level"],
        findings_count=score["findings_count"],
        findings=findings,
        severity_breakdown=score["severity_breakdown"],
        top_improvements=score["top_improvements"]
    )
