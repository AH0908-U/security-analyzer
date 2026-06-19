from tasks.celery_app import celery_app
from scanners.website_scanner import WebsiteScanner
from reporting.score_calculator import ScoreCalculator
from database import async_session
from models.monitor import Monitor
from sqlalchemy import select
import asyncio

score_calc = ScoreCalculator()

@celery_app.task
def run_monitored_scan(monitor_id: int):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_run_scan(monitor_id))
    loop.close()

async def _run_scan(monitor_id: int):
    async with async_session() as session:
        result = await session.execute(select(Monitor).where(Monitor.id == monitor_id))
        monitor = result.scalar_one_or_none()
        if not monitor or not monitor.is_active:
            return

        if monitor.monitor_type == "website":
            scanner = WebsiteScanner()
            scan_result = await scanner.scan(monitor.target)
        else:
            return

        findings = scan_result["findings"]
        score = score_calc.calculate(findings)
        monitor.last_score = score["score"]
        history = monitor.score_history or []
        history.append({"score": score["score"], "date": str(asyncio.get_event_loop().time())})
        if len(history) > 100:
            history = history[-100:]
        monitor.score_history = history
        await session.commit()

def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(3600.0, run_monitored_scan.s(0), name="check every hour")
