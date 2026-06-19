from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from reporting.simulation_engine import SimulationEngine
from database import async_session
from models.simulation import Simulation

router = APIRouter()
sim_engine = SimulationEngine()

class SimulationRequest(BaseModel):
    target: str
    attack_type: str = "phishing_email"
    difficulty: str = "basic"
    findings: Optional[List[dict]] = None

class SimulationResponse(BaseModel):
    id: Optional[int] = None
    target: str
    attack_type: str
    difficulty: str
    risk_percentage: float
    scenario_text: str
    rendered_email: dict
    exploited_vulns: list
    defense_tips: list

@router.post("/simulation/generate", response_model=SimulationResponse)
async def generate_simulation(req: SimulationRequest):
    findings = req.findings or []
    result = sim_engine.generate(req.target, findings, req.attack_type, req.difficulty)

    async with async_session() as session:
        sim = Simulation(
            target=req.target,
            attack_type=req.attack_type,
            difficulty=req.difficulty,
            risk_percentage=result["risk_percentage"],
            scenario_text=result["scenario_text"],
            rendered_email=result["rendered_email"],
            exploited_vulns=result["exploited_vulns"],
            defense_tips=result["defense_tips"]
        )
        session.add(sim)
        await session.commit()
        await session.refresh(sim)

    return SimulationResponse(
        id=sim.id,
        target=result["target"],
        attack_type=result["attack_type"],
        difficulty=result["difficulty"],
        risk_percentage=result["risk_percentage"],
        scenario_text=result["scenario_text"],
        rendered_email=result["rendered_email"],
        exploited_vulns=result["exploited_vulns"],
        defense_tips=result["defense_tips"]
    )

@router.get("/simulation/attack-types")
async def list_attack_types():
    return {"types": list(sim_engine.attack_templates.keys())}

@router.get("/simulation/history")
async def simulation_history():
    from sqlalchemy import select
    async with async_session() as session:
        result = await session.execute(select(Simulation).order_by(Simulation.created_at.desc()).limit(20))
        sims = result.scalars().all()
        return [
            SimulationResponse(
                id=s.id,
                target=s.target,
                attack_type=s.attack_type,
                difficulty=s.difficulty,
                risk_percentage=s.risk_percentage,
                scenario_text=s.scenario_text[:100] + "..." if s.scenario_text else "",
                rendered_email=s.rendered_email or {},
                exploited_vulns=s.exploited_vulns or [],
                defense_tips=s.defense_tips or []
            ) for s in sims
        ]
