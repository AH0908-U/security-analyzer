import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

class PageAnalyzer:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0, follow_redirects=True)

    async def analyze(self, url: str) -> List[Dict]:
        findings = []
        try:
            response = await self.client.get(url)
            soup = BeautifulSoup(response.text, "lxml")

            findings.extend(self._check_login_forms(soup, url))
            findings.extend(self._check_external_scripts(soup, url))
            findings.extend(self._check_iframes(soup))
            findings.extend(self._check_redirect_chains(response.history, url))
        except Exception:
            findings.append({
                "category": "page_analysis",
                "severity": "info",
                "title": "Page analysis skipped",
                "description": "Could not fetch page content for deep analysis",
                "score_impact": 0
            })
        finally:
            await self.client.aclose()
        return findings

    def _check_login_forms(self, soup: BeautifulSoup, page_url: str) -> List[Dict]:
        findings = []
        password_inputs = soup.find_all("input", attrs={"type": "password"})
        if password_inputs:
            page_domain = urlparse(page_url).netloc
            form_action = None
            for pwd in password_inputs:
                form = pwd.find_parent("form")
                if form:
                    action = form.get("action", "")
                    if action:
                        action_url = action if action.startswith("http") else urlparse(page_url)._replace(path=action).geturl()
                        action_domain = urlparse(action_url).netloc
                        if action_domain and action_domain != page_domain:
                            findings.append({
                                "category": "page_analysis",
                                "severity": "critical",
                                "title": "Login form submits to external domain",
                                "description": f"Password form on {page_domain} sends data to {action_domain}",
                                "score_impact": -30
                            })
                            return findings
            if not findings:
                findings.append({
                    "category": "page_analysis",
                    "severity": "info",
                    "title": "Login form detected",
                    "description": "Page contains a password field — ensure it uses HTTPS",
                    "score_impact": 0
                })
        return findings

    def _check_external_scripts(self, soup: BeautifulSoup, page_url: str) -> List[Dict]:
        findings = []
        page_domain = urlparse(page_url).netloc
        scripts = soup.find_all("script", src=True)
        external = set()
        for script in scripts:
            src = script["src"]
            if src.startswith("http"):
                src_domain = urlparse(src).netloc
                if src_domain and src_domain != page_domain:
                    external.add(src_domain)
        if external:
            findings.append({
                "category": "page_analysis",
                "severity": "low",
                "title": f"External scripts from {len(external)} domain(s)",
                "description": f"Loading JS from: {', '.join(list(external)[:5])}",
                "score_impact": -3
            })
        return findings

    def _check_iframes(self, soup: BeautifulSoup) -> List[Dict]:
        findings = []
        iframes = soup.find_all("iframe")
        hidden_iframes = [i for i in iframes if i.get("height") == "0" or i.get("width") == "0" or i.get("style", "").find("display:none") >= 0]
        if hidden_iframes:
            findings.append({
                "category": "page_analysis",
                "severity": "high",
                "title": "Hidden iframes detected",
                "description": f"{len(hidden_iframes)} hidden iframe(s) — possible clickjacking or malvertising",
                "score_impact": -12
            })
        return findings

    def _check_redirect_chains(self, history: List, url: str) -> List[Dict]:
        findings = []
        if len(history) >= 3:
            findings.append({
                "category": "page_analysis",
                "severity": "medium",
                "title": "Long redirect chain",
                "description": f"URL goes through {len(history)} redirects — possible cloaking",
                "score_impact": -8
            })
        return findings
