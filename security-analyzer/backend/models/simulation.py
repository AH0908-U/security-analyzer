from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=True)
    target = Column(Text)
    attack_type = Column(String(50))  # phishing_email, spear_phish, bec
    difficulty = Column(String(20))   # basic, advanced, realistic
    risk_percentage = Column(Float)
    scenario_text = Column(Text)
    rendered_email = Column(JSON)     # subject, body, sender, links
    exploited_vulns = Column(JSON)    # which findings were used
    defense_tips = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
