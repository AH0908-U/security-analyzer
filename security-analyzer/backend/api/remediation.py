from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel
from reporting.fix_engine import FixEngine

router = APIRouter()
fix_engine = FixEngine()

class RemediationRequest(BaseModel):
    finding_type: str
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = "medium"

class RemediationResponse(BaseModel):
    finding_title: str
    finding_description: str
    severity: str
    fix_summary: str
    steps: list
    code_snippets: list
    estimated_time: str
    difficulty: str
    resources: list
    compliance_mappings: list

@router.post("/remediation/generate", response_model=RemediationResponse)
async def generate_remediation(req: RemediationRequest):
    finding = {
        "finding_type": req.finding_type,
        "category": req.category or "",
        "title": req.title or req.finding_type,
        "description": req.description or "",
        "severity": req.severity,
        "compliance_mappings": []
    }
    fix = fix_engine.get_fix_for_finding(finding)
    return RemediationResponse(**fix)

@router.get("/remediation/finding-types")
async def list_finding_types():
    return {"types": list(fix_engine.fixes.keys())}
