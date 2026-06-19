import dns.resolver
import asyncio
from typing import List, Dict, Any
from datetime import datetime
import json

class DomainScanner:
    async def scan(self, domain: str) -> Dict[str, Any]:
        findings = []
        findings.extend(await self._check_spf(domain))
        findings.extend(await self._check_dkim(domain))
        findings.extend(await self._check_dmarc(domain))
        findings.extend(await self._check_dns_sec(domain))
        findings.extend(await self._check_mx_records(domain))
        return {"findings": findings, "domain": domain}

    async def _check_spf(self, domain: str) -> List[Dict]:
        findings = []
        try:
            answers = dns.resolver.resolve(domain, "TXT")
            spf_records = [str(a) for a in answers if str(a).startswith('"v=spf1') or str(a).startswith('v=spf1')]
            if not spf_records:
                findings.append({
                    "category": "spf",
                    "severity": "critical",
                    "title": "Missing SPF Record",
                    "description": "No SPF record found. Anyone can spoof emails from your domain.",
                    "score_impact": -20
                })
            else:
                spf = spf_records[0].strip('"')
                if "+all" in spf or "?all" in spf:
                    findings.append({
                        "category": "spf",
                        "severity": "high",
                        "title": "Weak SPF Policy",
                        "description": f"SPF uses permissive 'all' mechanism ({spf.split()[-1]}). Should use '-all'.",
                        "score_impact": -10
                    })
                if "~all" in spf:
                    findings.append({
                        "category": "spf",
                        "severity": "medium",
                        "title": "SoftFail SPF Policy",
                        "description": "SPF uses ~all (softfail) instead of -all (hard fail). Spoofed emails may still be delivered.",
                        "score_impact": -5
                    })
                if "-all" in spf:
                    findings.append({
                        "category": "spf",
                        "severity": "info",
                        "title": "Strong SPF Policy",
                        "description": "SPF uses -all (hard fail) — properly configured",
                        "score_impact": 5
                    })
        except dns.resolver.NoAnswer:
            findings.append({
                "category": "spf",
                "severity": "critical",
                "title": "Missing SPF Record",
                "description": "No SPF record found. Your domain is vulnerable to email spoofing.",
                "score_impact": -20
            })
        except Exception:
            findings.append({
                "category": "spf",
                "severity": "high",
                "title": "SPF Lookup Failed",
                "description": "Could not query SPF records for this domain",
                "score_impact": -5
            })
        return findings

    async def _check_dkim(self, domain: str) -> List[Dict]:
        findings = []
        selectors = ["default", "google", "selector1", "selector2", "dkim", "mail", "k1"]
        found_dkim = False
        for selector in selectors:
            try:
                dkim_domain = f"{selector}._domainkey.{domain}"
                answers = dns.resolver.resolve(dkim_domain, "TXT")
                if answers:
                    found_dkim = True
                    findings.append({
                        "category": "dkim",
                        "severity": "info",
                        "title": "DKIM Enabled",
                        "description": f"DKIM key found for selector '{selector}'",
                        "score_impact": 5
                    })
                    break
            except Exception:
                continue
        if not found_dkim:
            findings.append({
                "category": "dkim",
                "severity": "high",
                "title": "Missing DKIM Record",
                "description": "No DKIM key found. Emails may be tampered with in transit.",
                "score_impact": -12
            })
        return findings

    async def _check_dmarc(self, domain: str) -> List[Dict]:
        findings = []
        try:
            answers = dns.resolver.resolve(f"_dmarc.{domain}", "TXT")
            dmarc_records = [str(a) for a in answers if "v=DMARC1" in str(a)]
            if not dmarc_records:
                findings.append({
                    "category": "dmarc",
                    "severity": "high",
                    "title": "Missing DMARC Record",
                    "description": "No DMARC policy. Attackers can spoof your domain without consequences.",
                    "score_impact": -15
                })
            else:
                dmarc = dmarc_records[0]
                if "p=none" in dmarc:
                    findings.append({
                        "category": "dmarc",
                        "severity": "high",
                        "title": "DMARC Set to 'None'",
                        "description": "DMARC policy is p=none — monitoring only, no enforcement. Change to p=quarantine or p=reject.",
                        "score_impact": -10
                    })
                elif "p=quarantine" in dmarc:
                    findings.append({
                        "category": "dmarc",
                        "severity": "medium",
                        "title": "DMARC Set to 'Quarantine'",
                        "description": "DMARC policy is p=quarantine — suspicious emails go to spam. Consider p=reject for stronger protection.",
                        "score_impact": -3
                    })
                elif "p=reject" in dmarc:
                    findings.append({
                        "category": "dmarc",
                        "severity": "info",
                        "title": "DMARC Set to 'Reject'",
                        "description": "DMARC policy is p=reject — properly configured for maximum protection",
                        "score_impact": 10
                    })
                rua_match = dmarc.split("rua=")
                if len(rua_match) > 1:
                    rua_val = rua_match[1].split()[0].rstrip(';').strip(chr(34))
                    findings.append({
                        "category": "dmarc",
                        "severity": "info",
                        "title": "DMARC Reporting Enabled",
                        "description": f"Reports sent to: {rua_val}",
                        "score_impact": 3
                    })
        except dns.resolver.NoAnswer:
            findings.append({
                "category": "dmarc",
                "severity": "high",
                "title": "Missing DMARC Record",
                "description": "No DMARC record found",
                "score_impact": -15
            })
        except Exception:
            findings.append({
                "category": "dmarc",
                "severity": "high",
                "title": "DMARC Lookup Failed",
                "description": "Could not query DMARC records",
                "score_impact": -5
            })
        return findings

    async def _check_dns_sec(self, domain: str) -> List[Dict]:
        findings = []
        try:
            dns.resolver.resolve(domain, "DNSKEY")
            findings.append({
                "category": "dnssec",
                "severity": "info",
                "title": "DNSSEC Enabled",
                "description": "Domain has DNSSEC — protects against DNS spoofing",
                "score_impact": 5
            })
        except dns.resolver.NoAnswer:
            findings.append({
                "category": "dnssec",
                "severity": "low",
                "title": "DNSSEC Not Detected",
                "description": "Domain does not appear to have DNSSEC",
                "score_impact": -3
            })
        except Exception:
            pass
        return findings

    async def _check_mx_records(self, domain: str) -> List[Dict]:
        findings = []
        try:
            answers = dns.resolver.resolve(domain, "MX")
            mx_records = [str(a) for a in answers]
            if not mx_records:
                findings.append({
                    "category": "mx",
                    "severity": "high",
                    "title": "No MX Records",
                    "description": "Domain cannot receive emails — possible misconfiguration",
                    "score_impact": -8
                })
            else:
                for mx in mx_records:
                    if "google.com" in mx.lower() or "googlemail.com" in mx.lower():
                        findings.append({
                            "category": "mx",
                            "severity": "info",
                            "title": "Uses Google Workspace",
                            "description": f"MX: {mx.split()[-1]}",
                            "score_impact": 2
                        })
                        break
        except Exception:
            pass
        return findings
