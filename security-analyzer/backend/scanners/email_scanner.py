import re
import dns.resolver
from typing import List, Dict, Any
from urllib.parse import urlparse
import joblib
import os

class EmailScanner:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "ml", "phishing_model.pkl")
        self.vectorizer_path = os.path.join(os.path.dirname(__file__), "..", "ml", "nlp_pipeline.pkl")
        self.model = None
        self.vectorizer = None
        self._load_ml()

    def _load_ml(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            if os.path.exists(self.vectorizer_path):
                self.vectorizer = joblib.load(self.vectorizer_path)
        except Exception:
            self.model = None
            self.vectorizer = None

    async def scan(self, email_text: str) -> Dict[str, Any]:
        findings = []
        headers, body = self._parse_email(email_text)

        findings.extend(self._check_urgency_language(body))
        findings.extend(self._check_suspicious_links(body))
        findings.extend(self._check_sender_spoofing(headers))
        findings.extend(self._check_mismatched_urls(body))
        findings.extend(self._check_personal_info_requests(body))
        findings.extend(self._check_grammar_anomalies(body))
        findings.extend(self._check_attachments(headers, body))

        ml_score = self._ml_predict(email_text)
        if ml_score is not None:
            findings.append({
                "category": "ml_analysis",
                "severity": "high" if ml_score > 0.7 else "medium" if ml_score > 0.4 else "low",
                "title": "ML Phishing Score",
                "description": f"AI model predicts {ml_score*100:.1f}% probability of phishing",
                "score_impact": -int(ml_score * 30)
            })

        return {"findings": findings, "ml_score": ml_score}

    def _parse_email(self, email_text: str) -> tuple:
        headers = {}
        body = email_text
        lines = email_text.split("\n")
        header_end = 0
        for i, line in enumerate(lines):
            if line.strip() == "":
                header_end = i
                break
            if ":" in line:
                key, val = line.split(":", 1)
                headers[key.strip().lower()] = val.strip()
        body = "\n".join(lines[header_end:])
        return headers, body

    def _check_urgency_language(self, body: str) -> List[Dict]:
        findings = []
        urgency_patterns = [
            (r"account.*(?:suspended|closed|limited|blocked)", "Account suspension threat"),
            (r"urgent|immediately|asap|action required", "Urgency language"),
            (r"(?:24|48|72)\s*hours?", "Short time pressure"),
            (r"verify.*(?:account|identity|information)", "Verification request"),
            (r"unauthorized.*(?:access|login|attempt)", "Unauthorized access claim"),
            (r"click.*(?:here|link|below)", "Click prompting"),
            (r"failure to (?:comply|respond|update)", "Threat of consequence"),
            (r"dear (?:customer|user|member|valued)", "Generic greeting"),
        ]
        body_lower = body.lower()
        for pattern, desc in urgency_patterns:
            if re.search(pattern, body_lower):
                findings.append({
                    "category": "phishing_indicators",
                    "severity": "medium",
                    "title": f"Urgency/Deception: {desc}",
                    "description": f"Email contains {desc.lower()} — common in phishing",
                    "score_impact": -8
                })
        return findings

    def _check_suspicious_links(self, body: str) -> List[Dict]:
        findings = []
        url_pattern = r'https?://[^\s<>"\'\)]+'
        urls = re.findall(url_pattern, body)
        for url in urls:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()

            suspicious = False
            reasons = []

            if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
                suspicious = True
                reasons.append("Uses raw IP address instead of domain")

            shortening_domains = ["bit.ly", "tinyurl.com", "t.co", "shorturl.at", "rb.gy", "short.link", "cutt.ly"]
            if any(sd in domain for sd in shortening_domains):
                suspicious = True
                reasons.append("Uses URL shortener (hides real destination)")

            if "@" in domain:
                suspicious = True
                reasons.append("Contains @ symbol — browser may ignore preceding text")

            if domain.count(".") > 3:
                suspicious = True
                reasons.append("Excessive subdomains (could hide true domain)")

            if suspicious:
                findings.append({
                    "category": "suspicious_links",
                    "severity": "high",
                    "title": f"Suspicious link detected",
                    "description": f"URL: {url[:80]} — {'; '.join(reasons)}",
                    "score_impact": -12
                })
        return findings

    def _check_sender_spoofing(self, headers: Dict) -> List[Dict]:
        findings = []
        from_header = headers.get("from", "")
        reply_to = headers.get("reply-to", "")
        return_path = headers.get("return-path", "")

        if from_header and "@" in from_header:
            match = re.search(r'<([^>]+)>', from_header)
            if match:
                sender_email = match.group(1)
            else:
                sender_email = from_header

            sender_domain = sender_email.split("@")[-1].strip(">")

            display_name = from_header.split("<")[0].strip()
            if display_name and sender_domain:
                brand_keywords = ["paypal", "google", "microsoft", "amazon", "apple", "netflix", "bank", "chase", "wells fargo"]
                for brand in brand_keywords:
                    if brand in display_name.lower() and brand not in sender_domain.lower():
                        findings.append({
                            "category": "spoofing",
                            "severity": "critical",
                            "title": "Display name / email mismatch",
                            "description": f"Shows '{display_name}' but sent from '{sender_domain}'",
                            "score_impact": -25
                        })
                        break

            if reply_to and "@" in reply_to:
                reply_domain = reply_to.split("@")[-1].strip(">")
                if reply_domain != sender_domain:
                    findings.append({
                        "category": "spoofing",
                        "severity": "high",
                        "title": "Reply-To differs from From",
                        "description": f"From: {sender_domain}, Reply-To: {reply_domain}",
                        "score_impact": -15
                    })
        return findings

    def _check_mismatched_urls(self, body: str) -> List[Dict]:
        findings = []
        html_link_pattern = re.compile(r'<a\s+[^>]*href=["\'](https?://[^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE)
        for match in html_link_pattern.finditer(body):
            href = match.group(1)
            text = match.group(2)
            if href and text and "http" in text:
                href_domain = urlparse(href).netloc
                text_domain = urlparse(text).netloc
                if href_domain and text_domain and href_domain != text_domain:
                    findings.append({
                        "category": "mismatched_urls",
                        "severity": "critical",
                        "title": "Hidden link redirect",
                        "description": f"Link shows '{text_domain}' but goes to '{href_domain}'",
                        "score_impact": -25
                    })
        return findings

    def _check_personal_info_requests(self, body: str) -> List[Dict]:
        findings = []
        info_patterns = [
            (r"password|passwd|pwd", "Password request"),
            (r"ssn|social security|tax id", "SSN/Tax ID request"),
            (r"credit card|debit card|cc number|card number", "Payment card request"),
            (r"bank account|routing number|account number", "Banking info request"),
            (r"mother.?s maiden|security question|secret question", "Security question request"),
            (r"date of birth|birth date|dob", "Date of birth request"),
        ]
        body_lower = body.lower()
        for pattern, desc in info_patterns:
            if re.search(pattern, body_lower):
                findings.append({
                    "category": "info_request",
                    "severity": "high",
                    "title": f"Requests sensitive info: {desc}",
                    "description": "Legitimate companies never request this via email",
                    "score_impact": -15
                })
        return findings

    def _check_grammar_anomalies(self, body: str) -> List[Dict]:
        findings = []
        excessive_caps = len(re.findall(r'\b[A-Z]{4,}\b', body))
        if excessive_caps > 3:
            findings.append({
                "category": "anomalies",
                "severity": "low",
                "title": "Excessive capitalization",
                "description": f"{excessive_caps} all-caps words — common in phishing",
                "score_impact": -4
            })
        excessive_excl = body.count("!!!")
        if excessive_excl > 2:
            findings.append({
                "category": "anomalies",
                "severity": "low",
                "title": "Excessive exclamation marks",
                "description": "Multiple '!!!' patterns — uncommon in professional email",
                "score_impact": -3
            })
        return findings

    def _check_attachments(self, headers: Dict, body: str) -> List[Dict]:
        findings = []
        suspicious_extensions = [".exe", ".scr", ".bat", ".cmd", ".vbs", ".ps1", ".jar", ".zip", ".rar"]
        for ext in suspicious_extensions:
            if ext in body.lower() and ("attached" in body.lower() or "attachment" in body.lower() or "download" in body.lower()):
                findings.append({
                    "category": "attachments",
                    "severity": "high",
                    "title": f"Suspicious attachment type ({ext})",
                    "description": f"Email references {ext} files — common malware delivery vector",
                    "score_impact": -12
                })
                break
        return findings

    def _ml_predict(self, text: str) -> float:
        if self.model and self.vectorizer:
            try:
                vec = self.vectorizer.transform([text])
                proba = self.model.predict_proba(vec)[0]
                return proba[1] if len(proba) > 1 else proba[0]
            except Exception:
                return None
        return None
