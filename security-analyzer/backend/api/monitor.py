from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, async_session
from models.monitor import Monitor

router = APIRouter()

class CreateMonitorRequest(BaseModel):
    target: str
    monitor_type: str = "website"
    interval_hours: int = 24
    alert_email: bool = False
    alert_slack: bool = False
    alert_telegram: bool = False

    @field_validator("interval_hours")
    @classmethod
    def validate_interval(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Interval must be at least 1 hour")
        if v > 720:
            raise ValueError("Interval cannot exceed 720 hours")
        return v

class MonitorResponse(BaseModel):
    id: int
    target: str
    monitor_type: str
    interval_hours: int
    is_active: bool
    last_score: Optional[float]
    score_history: list
    created_at: str

@router.post("/monitors", response_model=MonitorResponse)
async def create_monitor(req: CreateMonitorRequest):
    async with async_session() as session:
        monitor = Monitor(
            target=req.target,
            monitor_type=req.monitor_type,
            interval_hours=req.interval_hours,
            alert_email=req.alert_email,
            alert_slack=req.alert_slack,
            alert_telegram=req.alert_telegram,
            score_history=[]
        )
        session.add(monitor)
        await session.commit()
        await session.refresh(monitor)
        return MonitorResponse(
            id=monitor.id,
            target=monitor.target,
            monitor_type=monitor.monitor_type,
            interval_hours=monitor.interval_hours,
            is_active=monitor.is_active,
            last_score=monitor.last_score,
            score_history=monitor.score_history or [],
            created_at=monitor.created_at.isoformat() if monitor.created_at else ""
        )

@router.get("/monitors", response_model=List[MonitorResponse])
async def list_monitors():
    async with async_session() as session:
        result = await session.execute(select(Monitor).order_by(Monitor.created_at.desc()))
        monitors = result.scalars().all()
        return [
            MonitorResponse(
                id=m.id,
                target=m.target,
                monitor_type=m.monitor_type,
                interval_hours=m.interval_hours,
                is_active=m.is_active,
                last_score=m.last_score,
                score_history=m.score_history or [],
                created_at=m.created_at.isoformat() if m.created_at else ""
            ) for m in monitors
        ]

@router.get("/monitors/{monitor_id}", response_model=MonitorResponse)
async def get_monitor(monitor_id: int):
    async with async_session() as session:
        result = await session.execute(select(Monitor).where(Monitor.id == monitor_id))
        monitor = result.scalar_one_or_none()
        if not monitor:
            raise HTTPException(status_code=404, detail="Monitor not found")
        return MonitorResponse(
            id=monitor.id,
            target=monitor.target,
            monitor_type=monitor.monitor_type,
            interval_hours=monitor.interval_hours,
            is_active=monitor.is_active,
            last_score=monitor.last_score,
            score_history=monitor.score_history or [],
            created_at=monitor.created_at.isoformat() if monitor.created_at else ""
        )

@router.delete("/monitors/{monitor_id}")
async def delete_monitor(monitor_id: int):
    async with async_session() as session:
        result = await session.execute(select(Monitor).where(Monitor.id == monitor_id))
        monitor = result.scalar_one_or_none()
        if not monitor:
            raise HTTPException(status_code=404, detail="Monitor not found")
        await session.delete(monitor)
        await session.commit()
        return {"message": "Monitor deleted"}
