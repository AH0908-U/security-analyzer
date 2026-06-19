from typing import List, Dict, Any

class ScoreCalculator:
    BASE_SCORE = 100
    MAX_CATEGORY_PENALTY = 40

    def calculate(self, findings: List[Dict]) -> Dict[str, Any]:
        total_penalty = sum(f.get("score_impact", 0) for f in findings)
        category_penalties = {}
        for f in findings:
            cat = f.get("category", "other")
            sev = f.get("severity", "info")
            impact = abs(f.get("score_impact", 0))
            severity_multiplier = {"critical": 1.0, "high": 0.8, "medium": 0.6, "low": 0.3, "info": 0.1}
            effective = impact * severity_multiplier.get(sev, 0.5)
            category_penalties[cat] = category_penalties.get(cat, 0) + effective

        for cat in category_penalties:
            category_penalties[cat] = min(category_penalties[cat], self.MAX_CATEGORY_PENALTY)

        total_adjusted = sum(category_penalties.values())
        score = max(0, min(100, self.BASE_SCORE - total_adjusted))

        if score >= 80:
            risk = "safe"
        elif score >= 60:
            risk = "low"
        elif score >= 40:
            risk = "medium"
        elif score >= 20:
            risk = "high"
        else:
            risk = "critical"

        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for f in findings:
            sev = f.get("severity", "info")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        improvements = []
        if risk in ("critical", "high"):
            for f in findings:
                if f.get("severity") in ("critical", "high"):
                    improvements.append(f.get("title", ""))

        return {
            "score": round(score, 1),
            "risk_level": risk,
            "findings_count": len(findings),
            "severity_breakdown": severity_counts,
            "top_improvements": improvements[:5]
        }
