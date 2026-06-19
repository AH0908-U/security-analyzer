from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target = Column(Text)
    monitor_type = Column(String(50))  # website, domain
    interval_hours = Column(Integer, default=24)
    is_active = Column(Boolean, default=True)
    last_score = Column(Float, nullable=True)
    score_history = Column(JSON, default=list)
    alert_email = Column(Boolean, default=False)
    alert_slack = Column(Boolean, default=False)
    alert_telegram = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MonitorAlert(Base):
    __tablename__ = "monitor_alerts"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"))
    alert_type = Column(String(50))  # score_drop, new_vuln, scan_failed
    message = Column(Text)
    sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
