from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scan_type = Column(String(50))  # website, email, domain, breach
    target = Column(Text)  # URL, email content, domain
    overall_score = Column(Float)
    risk_level = Column(String(20))  # safe, low, medium, high, critical
    summary = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    category = Column(String(100))  # ssl, headers, phishing, spf, etc.
    severity = Column(String(20))   # critical, high, medium, low, info
    title = Column(String(255))
    description = Column(Text)
    details = Column(JSON)
    score_impact = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
