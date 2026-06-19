from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    finding_type = Column(String(100))  # missing_spf, weak_ssl, no_hsts, etc.
    category = Column(String(50))  # email, web, domain, auth
    severity = Column(String(20))
    title = Column(String(255))
    description = Column(Text)
    impact = Column(Text)
    fix_summary = Column(Text)
    fix_details = Column(JSON)  # steps, code_snippets, links
    is_fixed = Column(Boolean, default=False)
    compliance_mappings = Column(JSON)  # GDPR, PCI-DSS, ISO 27001 refs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
