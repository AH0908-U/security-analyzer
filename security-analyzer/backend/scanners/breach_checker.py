from typing import List, Dict, Any
import httpx
from config import settings

class BreachChecker:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)

    async def check_email(self, email: str) -> Dict[str, Any]:
        findings = []
        if settings.hibp_api_key:
            try:
                headers = {"hibp-api-key": settings.hibp_api_key}
                resp = await self.client.get(
                    f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}",
                    headers=headers
                )
                if resp.status_code == 200:
                    breaches = resp.json()
                    findings.append({
                        "category": "breaches",
                        "severity": "high",
                        "title": f"Found in {len(breaches)} data breach(es)",
                        "description": f"Email associated with breaches: {', '.join(b['Name'] for b in breaches[:5])}",
                        "details": breaches,
                        "score_impact": -15
                    })
                elif resp.status_code == 404:
                    findings.append({
                        "category": "breaches",
                        "severity": "info",
                        "title": "No breaches found",
                        "description": "Email not found in known data breaches",
                        "score_impact": 5
                    })
            except Exception as e:
                findings.append({
                    "category": "breaches",
                    "severity": "info",
                    "title": "Breach check unavailable",
                    "description": f"Could not check data breaches: {str(e)}",
                    "score_impact": 0
                })
        await self.client.aclose()
        return {"findings": findings}
