import random
from typing import List, Dict, Any, Optional

class SimulationEngine:
    def __init__(self):
        self.attack_templates = {
            "phishing_email": self._generate_phishing_email,
            "spear_phish": self._generate_spear_phish,
            "bec": self._generate_bec,
        }

    def generate(self, target: str, findings: List[Dict], attack_type: str = "phishing_email", difficulty: str = "basic") -> Dict[str, Any]:
        generator = self.attack_templates.get(attack_type, self._generate_phishing_email)
        exploited = self._select_exploitable_findings(findings, difficulty)
        scenario = generator(target, exploited, difficulty)
        risk_pct = self._calculate_risk(exploited, difficulty)

        return {
            "target": target,
            "attack_type": attack_type,
            "difficulty": difficulty,
            "risk_percentage": risk_pct,
            "scenario_text": scenario["scenario"],
            "rendered_email": scenario["email"],
            "exploited_vulns": exploited,
            "defense_tips": self._generate_defense_tips(exploited)
        }

    def _select_exploitable_findings(self, findings: List[Dict], difficulty: str) -> List[Dict]:
        if not findings:
            return [
                {"finding_type": "missing_spf", "title": "No SPF record", "category": "spf", "severity": "critical"},
                {"finding_type": "no_dmarc", "title": "No DMARC policy", "category": "dmarc", "severity": "high"},
            ]

        exploitable = [f for f in findings if f.get("severity") in ("critical", "high")]
        if not exploitable:
            exploitable = [f for f in findings if f.get("severity") in ("medium",)]
        if not exploitable:
            exploitable = [findings[0]]

        if difficulty == "basic":
            return exploitable[:2]
        elif difficulty == "advanced":
            return exploitable[:4]
        else:
            return exploitable

    def _generate_phishing_email(self, target: str, exploited: List[Dict], difficulty: str) -> Dict:
        vuln_titles = [v.get("title", "security weakness") for v in exploited]
        vuln_text = ", ".join(vuln_titles)

        brands = ["PayPal", "Google", "Microsoft", "Amazon", "Apple", "Netflix", "Dropbox"]
        brand = random.choice(brands)
        fake_domains = [f"{brand.lower()}-secure.net", f"{brand.lower()}verify.com", f"account-{brand.lower()}.xyz"]
        fake_domain = random.choice(fake_domains)

        subjects = [
            f"Urgent: Your {brand} account has been limited",
            f"Security alert: Unusual sign-in detected",
            f"Action required: Update your {brand} payment method",
            f"Your {brand} invoice is ready — payment overdue",
            f"Critical security notification for your {brand} account",
        ]
        subject = random.choice(subjects)

        body_templates = [
            f"""Dear Valued Customer,

We detected unusual activity on your {brand} account. As a security measure, we have temporarily limited access to your account.

To restore full access, please verify your identity immediately:
👉 {fake_domain}/verify

Failure to verify within 24 hours will result in permanent account suspension.

Thank you,
{brand} Security Team""",
            f"""Dear Customer,

Your {brand} billing information needs to be updated. Our records indicate your payment method has expired.

Please update your payment details here to avoid service interruption:
👉 {fake_domain}/billing/update

This process takes less than 2 minutes.

Regards,
{brand} Billing Department""",
        ]
        body = random.choice(body_templates)

        scenario = f"""This attack exploits your {vuln_text} vulnerabilities.

1. Attacker registers {fake_domain} (typosquatting {brand})
2. Email crafted to look identical to {brand}'s official emails
3. Because your domain lacks proper email authentication, this email would NOT be flagged
4. Recipient clicks the link, enters credentials on fake login page
5. Attacker now has valid credentials to the real {brand} account"""

        return {
            "scenario": scenario,
            "email": {
                "subject": subject,
                "from": f"{brand} Security <security@{fake_domain}>",
                "reply_to": f"verify@{fake_domain}",
                "body": body,
                "links": [fake_domain],
                "urgency_indicators": ["24 hours", "suspended", "immediately"],
                "brand_impersonated": brand
            }
        }

    def _generate_spear_phish(self, target: str, exploited: List[Dict], difficulty: str) -> Dict:
        vuln_titles = [v.get("title", "security weakness") for v in exploited]
        vuln_text = ", ".join(vuln_titles)

        scenario = f"""Spear-phishing attack targeting {target}:

Since your organization has {vuln_text} vulnerabilities, the attacker would:
1. Research employees via LinkedIn to find specific roles (CEO, CFO, IT admin)
2. Craft personalized emails referencing real projects and colleagues
3. Bypass email filters due to missing SPF/DKIM/DMARC
4. Use a compromised vendor account or similar domain to increase trust
5. Request wire transfer or credential access

Example email to your CFO:
Subject: Urgent: Vendor payment for Q3 project
From: "CEO Name" <ceo.name@gmail.com> (real CEO name, fake Gmail)
Body: "I'm in meetings all day. Need you to process payment #INV-2024-893 for $47,830 to the attached invoice. Wire to account ending in 4392. Confirm when done.""

Without proper email authentication and security training, this attack has a high success rate."""

        return {
            "scenario": scenario,
            "email": {
                "subject": f"Urgent: Vendor payment for Q3 project",
                "from": f"CEO <ceo@company-email.com>",
                "reply_to": f"ceo.personal@gmail.com",
                "body": "I'm in meetings all day. Need you to process payment #INV-2024-893 for $47,830 to the attached invoice. Wire to account ending in 4392. Confirm when done.",
                "links": [],
                "urgency_indicators": ["Urgent", "Confirm when done"],
                "attack_technique": "Business Email Compromise via CEO impersonation"
            }
        }

    def _generate_bec(self, target: str, exploited: List[Dict], difficulty: str) -> Dict:
        base = self._generate_spear_phish(target, exploited, difficulty)
        base["scenario"] = f"""Business Email Compromise (BEC) Attack Simulation:

Because {' and '.join(v.get('title','') for v in exploited[:2])}:

1. Attacker spoofs your domain using missing SPF/DKIM/DMARC
2. Impersonates a C-level executive
3. Sends urgent payment request to finance team
4. No email authentication = email lands in inbox, not spam
5. Average BEC loss in 2026: $125,000 per incident

This is the most financially damaging cyber attack type."""
        return base

    def _calculate_risk(self, exploited: List[Dict], difficulty: str) -> float:
        base = 50
        for v in exploited:
            sev = v.get("severity", "low")
            sev_values = {"critical": 15, "high": 10, "medium": 5, "low": 2}
            base += sev_values.get(sev, 3)
        difficulty_bonus = {"basic": 0, "advanced": 10, "realistic": 20}
        base += difficulty_bonus.get(difficulty, 0)
        return min(99, base)

    def _generate_defense_tips(self, exploited: List[Dict]) -> List[str]:
        tips = []
        for v in exploited:
            cat = v.get("category", "")
            if cat in ("spf", "dmarc", "dkim"):
                tips.append("Implement DMARC with p=reject policy to prevent email spoofing")
                tips.append("Add SPF record with -all (hard fail) to authorize only your mail servers")
            elif cat in ("ssl", "https"):
                tips.append("Keep SSL/TLS certificates up to date and use strong ciphers")
            elif cat in ("headers", "csp"):
                tips.append("Implement Content Security Policy (CSP) to prevent XSS and data injection")
        if not tips:
            tips = [
                "Enable multi-factor authentication on all accounts",
                "Conduct regular security awareness training for employees",
                "Use a password manager and enforce strong password policies",
                "Keep all software and systems updated",
            ]
        return tips[:5]
