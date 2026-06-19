import httpx
import ssl
import socket
from typing import List, Dict, Any
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from datetime import datetime
import re

class WebsiteScanner:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=15.0, verify=True)

    async def scan(self, url: str) -> Dict[str, Any]:
        findings = []
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path

        try:
            response = await self.client.get(url, follow_redirects=True)
            headers = response.headers
            html = response.text

            findings.extend(await self._check_ssl(domain))
            findings.extend(self._check_security_headers(headers))
            findings.extend(await self._check_cookies(headers))
            findings.extend(self._check_csp(headers))
            findings.extend(await self._check_tech_stack(html, headers))
            findings.extend(self._check_https_enforcement(url, response))
            findings.extend(self._check_form_security(html, url))
        except Exception as e:
            findings.append({
                "category": "connectivity",
                "severity": "high",
                "title": "Failed to reach website",
                "description": f"Could not connect to {url}: {str(e)}",
                "score_impact": -20
            })

        await self.client.aclose()
        return {"findings": findings, "url": url, "domain": domain}

    async def _check_ssl(self, domain: str) -> List[Dict]:
        findings = []
        try:
            ctx = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    if cert:
                        exp_date = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
                        days_left = (exp_date - datetime.utcnow()).days
                        if days_left < 0:
                            findings.append({"category": "ssl", "severity": "critical", "title": "SSL Certificate Expired", "description": f"SSL cert expired {abs(days_left)} days ago", "score_impact": -30})
                        elif days_left < 15:
                            findings.append({"category": "ssl", "severity": "high", "title": "SSL Certificate Expiring Soon", "description": f"SSL cert expires in {days_left} days", "score_impact": -15})
                        issuer = dict(x[0] for x in cert["issuer"])
                        if "Let's Encrypt" in str(issuer):
                            findings.append({"category": "ssl", "severity": "info", "title": "SSL Issuer: Let's Encrypt", "description": "Using a free SSL certificate authority", "score_impact": 0})

                        cipher = ssock.cipher()
                        if cipher and cipher[0] in ("TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384"):
                            pass
                        else:
                            findings.append({"category": "ssl", "severity": "medium", "title": "Weak SSL/TLS Cipher", "description": f"Using {cipher[0]} which is outdated", "score_impact": -8})
        except Exception as e:
            findings.append({"category": "ssl", "severity": "critical", "title": "SSL Check Failed", "description": f"Could not verify SSL: {str(e)}", "score_impact": -15})
        return findings

    def _check_security_headers(self, headers: Dict) -> List[Dict]:
        findings = []
        checks = {
            "Strict-Transport-Security": {"severity": "medium", "title": "Missing HSTS Header", "desc": "No HTTP Strict-Transport-Security header", "impact": -10},
            "X-Frame-Options": {"severity": "medium", "title": "Missing X-Frame-Options", "desc": "Site may be vulnerable to clickjacking", "impact": -8},
            "X-Content-Type-Options": {"severity": "low", "title": "Missing X-Content-Type-Options", "desc": "Browser may MIME-sniff responses", "impact": -5},
            "Content-Security-Policy": {"severity": "high", "title": "Missing CSP Header", "desc": "No Content Security Policy defined", "impact": -12},
            "X-XSS-Protection": {"severity": "low", "title": "Missing X-XSS-Protection", "desc": "Legacy XSS filter not enabled", "impact": -3},
            "Referrer-Policy": {"severity": "low", "title": "Missing Referrer-Policy", "desc": "Referrer information may leak in links", "impact": -3},
            "Permissions-Policy": {"severity": "low", "title": "Missing Permissions-Policy", "desc": "No feature permissions policy set", "impact": -3},
        }
        for header, info in checks.items():
            if header not in headers:
                findings.append({"category": "headers", "severity": info["severity"], "title": info["title"], "description": info["desc"], "score_impact": info["impact"]})
        return findings

    async def _check_cookies(self, headers: Dict) -> List[Dict]:
        findings = []
        set_cookie = headers.get("set-cookie", "")
        if set_cookie:
            if "Secure" not in set_cookie:
                findings.append({"category": "cookies", "severity": "high", "title": "Cookies Missing Secure Flag", "description": "Cookies sent over unencrypted connections", "score_impact": -10})
            if "HttpOnly" not in set_cookie:
                findings.append({"category": "cookies", "severity": "medium", "title": "Cookies Missing HttpOnly Flag", "description": "Cookies accessible via JavaScript (XSS risk)", "score_impact": -7})
            if "SameSite" not in set_cookie:
                findings.append({"category": "cookies", "severity": "medium", "title": "Cookies Missing SameSite Flag", "description": "CSRF protection not enforced on cookies", "score_impact": -6})
        return findings

    def _check_csp(self, headers: Dict) -> List[Dict]:
        findings = []
        csp = headers.get("content-security-policy", "")
        if csp:
            if "'unsafe-inline'" in csp or "'unsafe-eval'" in csp:
                findings.append({"category": "csp", "severity": "high", "title": "CSP Allows Unsafe Directives", "description": "CSP uses unsafe-inline or unsafe-eval, weakening XSS protection", "score_impact": -10})
        return findings

    async def _check_tech_stack(self, html: str, headers: Dict) -> List[Dict]:
        findings = []
        soup = BeautifulSoup(html, "lxml")
        generator = soup.find("meta", attrs={"name": "generator"})
        if generator and generator.get("content"):
            cms = generator["content"].lower()
            vuln_cms = {"wordpress": "WordPress", "joomla": "Joomla", "drupal": "Drupal"}
            for key, name in vuln_cms.items():
                if key in cms:
                    findings.append({"category": "tech", "severity": "info", "title": f"Uses {name}", "description": f"Site built with {name} — check for version-specific CVEs", "score_impact": -2})

        server = headers.get("server", "")
        if server and "Apache/2" in server:
            findings.append({"category": "tech", "severity": "low", "title": "Older Apache Version", "description": f"Server: {server}", "score_impact": -4})
        if "X-Powered-By" in headers:
            findings.append({"category": "tech", "severity": "info", "title": "Tech Stack Exposed", "description": f"X-Powered-By: {headers['X-Powered-By']}", "score_impact": -3})
        return findings

    def _check_https_enforcement(self, url: str, response) -> List[Dict]:
        findings = []
        if url.startswith("http://"):
            findings.append({"category": "https", "severity": "critical", "title": "No HTTPS", "description": "Site is served over unencrypted HTTP", "score_impact": -25})
        if response.url and response.url != url:
            findings.append({"category": "https", "severity": "info", "title": "Redirects to Different URL", "description": f"Redirected to {response.url}", "score_impact": 0})
        return findings

    def _check_form_security(self, html: str, url: str) -> List[Dict]:
        findings = []
        soup = BeautifulSoup(html, "lxml")
        forms = soup.find_all("form")
        for form in forms:
            action = form.get("action", "")
            if action and not action.startswith("https"):
                findings.append({"category": "forms", "severity": "high", "title": "Form Submits Over HTTP", "description": f"Form action '{action}' uses insecure protocol", "score_impact": -10})
            password_inputs = form.find_all("input", attrs={"type": "password"})
            if password_inputs and not url.startswith("https"):
                findings.append({"category": "forms", "severity": "critical", "title": "Password Field on HTTP Page", "description": "Login form transmitted without encryption", "score_impact": -30})
        return findings
