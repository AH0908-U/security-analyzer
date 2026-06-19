from typing import List, Dict, Any, Optional
import httpx
from config import settings

class ThreatLookup:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)

    async def check_virustotal(self, url: str) -> Optional[Dict]:
        if not settings.virustotal_api_key:
            return None
        try:
            headers = {"x-apikey": settings.virustotal_api_key}
            resp = await self.client.post(
                "https://www.virustotal.com/api/v3/urls",
                headers=headers,
                data={"url": url}
            )
            if resp.status_code == 200:
                data = resp.json()
                analysis_id = data.get("data", {}).get("id", "")
                if analysis_id:
                    result = await self.client.get(
                        f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
                        headers=headers
                    )
                    if result.status_code == 200:
                        stats = result.json().get("data", {}).get("attributes", {}).get("stats", {})
                        return stats
        except Exception:
            pass
        return None

    async def check_phishtank(self, url: str) -> Optional[bool]:
        if not settings.phishtank_api_key:
            return None
        try:
            resp = await self.client.post(
                "https://checkurl.phishtank.com/checkurl/",
                data={"url": url, "format": "json", "app_key": settings.phishtank_api_key}
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("results", {}).get("in_database", False)
        except Exception:
            pass
        return None

    async def check_google_safe_browsing(self, url: str) -> Optional[bool]:
        if not settings.google_safe_browsing_api_key:
            return None
        try:
            payload = {
                "client": {"clientId": "security-analyzer", "clientVersion": "1.0.0"},
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntries": [{"url": url}]
                }
            }
            resp = await self.client.post(
                f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.google_safe_browsing_api_key}",
                json=payload
            )
            if resp.status_code == 200:
                data = resp.json()
                return "matches" in data
        except Exception:
            pass
        return None
