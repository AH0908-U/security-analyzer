from typing import List, Dict, Any

class HomographDetector:
    CONFUSABLE_MAP = {
        'a': ['à', 'á', 'â', 'ã', 'ä', 'å', 'ɑ', 'а', 'ᴀ'],
        'c': ['ç', 'ć', 'ĉ', 'ċ', 'č', 'с', 'ᴄ'],
        'e': ['è', 'é', 'ê', 'ë', 'ē', 'ĕ', 'ė', 'ę', 'ě', 'е', 'ᵉ'],
        'i': ['ì', 'í', 'î', 'ï', 'ĩ', 'ī', 'ĭ', 'į', 'ı', 'і', 'í'],
        'o': ['ò', 'ó', 'ô', 'õ', 'ö', 'ō', 'ŏ', 'ő', 'ο', 'о', 'ᴏ'],
        'u': ['ù', 'ú', 'û', 'ü', 'ũ', 'ū', 'ŭ', 'ů', 'ű', 'υ', 'ц'],
        'p': ['ρ', 'р', 'ⲣ'],
        's': ['ѕ', 'ѕ', 'ꜱ'],
        'x': ['х', 'ҳ', 'ẋ'],
        'y': ['у', 'ÿ', 'ў'],
        '0': ['о', 'ο', 'Օ'],
        '1': ['l', 'í', '|'],
        'l': ['1', 'í', '|'],
    }

    def detect(self, domain: str) -> List[Dict]:
        findings = []
        domain_lower = domain.lower()
        known_brands = ["paypal", "google", "microsoft", "amazon", "apple", "netflix", "facebook", "instagram", "twitter", "linkedin", "dropbox", "adobe", "github", "slack"]

        for brand in known_brands:
            if brand in domain_lower:
                continue
            score = self._similarity_score(brand, domain_lower)
            if score > 0.7 and brand not in domain_lower:
                findings.append({
                    "category": "homograph",
                    "severity": "high",
                    "title": f"Possible homograph attack: {domain}",
                    "description": f"Domain visually similar to '{brand}' (similarity: {score:.0%})",
                    "score_impact": -15
                })
                break

        for char in domain:
            if ord(char) > 127:
                findings.append({
                    "category": "homograph",
                    "severity": "medium",
                    "title": "Unicode characters in domain",
                    "description": f"Domain contains non-ASCII character '{char}' (U+{ord(char):04X}) — possible homograph attack",
                    "score_impact": -10
                })
                break

        return findings

    def _similarity_score(self, s1: str, s2: str) -> float:
        if len(s1) == 0 or len(s2) == 0:
            return 0
        max_len = max(len(s1), len(s2))
        matches = 0
        for i in range(min(len(s1), len(s2))):
            if s1[i] == s2[i]:
                matches += 1
            elif s2[i] in self.CONFUSABLE_MAP.get(s1[i], []):
                matches += 0.8
        return matches / max_len
