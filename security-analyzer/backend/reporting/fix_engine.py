import json
import os
from typing import Dict, Any, Optional, List

class FixEngine:
    def __init__(self):
        kb_path = os.path.join(os.path.dirname(__file__), "..", "knowledge_base", "fixes.json")
        self.fixes = {}
        if os.path.exists(kb_path):
            with open(kb_path) as f:
                self.fixes = json.load(f)

    def get_fix(self, finding_type: str, category: str = None) -> Optional[Dict]:
        direct = self.fixes.get(finding_type)
        if direct:
            return direct
        if category:
            for key, val in self.fixes.items():
                if category in key or key in finding_type:
                    return val
        return self.fixes.get("generic", {})

    def get_fix_for_finding(self, finding: Dict) -> Dict:
        finding_type = finding.get("finding_type", "")
        category = finding.get("category", "")
        fix = self.get_fix(finding_type, category)
        if not fix:
            fix = {
                "summary": "No specific fix guide available",
                "steps": ["Research this issue for your specific platform"],
                "code_snippets": [],
                "resources": []
            }
        return {
            "finding_title": finding.get("title", ""),
            "finding_description": finding.get("description", ""),
            "severity": finding.get("severity", ""),
            "fix_summary": fix.get("summary", ""),
            "steps": fix.get("steps", []),
            "code_snippets": fix.get("code_snippets", []),
            "estimated_time": fix.get("estimated_time", "30 min"),
            "difficulty": fix.get("difficulty", "medium"),
            "resources": fix.get("resources", []),
            "compliance_mappings": finding.get("compliance_mappings", [])
        }

    def get_all_fixes_for_findings(self, findings: List[Dict]) -> List[Dict]:
        return [self.get_fix_for_finding(f) for f in findings]
