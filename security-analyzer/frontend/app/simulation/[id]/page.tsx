'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import MagneticCard from '@/components/ui/MagneticCard'
import ThreeBackground from '@/components/3d/ThreeBackground'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { api } from '@/lib/api'
import { SimulationResponse } from '@/lib/types'

export default function SimulationDetailPage() {
  const params = useParams()
  const [sim, setSim] = useState<SimulationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSim = async () => {
      try {
        const history = await api.simulation.history()
        const found = history.find((s: any) => s.id === Number(params.id))
        if (found) setSim(found)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSim()
  }, [params.id])

  if (loading) return <div className="pt-28"><ThreeBackground /><LoadingSpinner text="Loading simulation..." /></div>

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,247,0.12), transparent 70%)', top: '-5%', right: '10%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-2xl font-heading font-bold glow-text mb-6">Simulation Details</h1>
        {sim ? (
          <div className="space-y-4">
            <MagneticCard hud glow>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {sim.attack_type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-600 font-medium">{sim.difficulty}</span>
                <span className="ml-auto text-lg font-heading font-bold text-amber-400">{sim.risk_percentage}%</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{sim.scenario_text}</p>
            </MagneticCard>

            <MagneticCard hud>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">
                Defense Tips
              </h3>
              <div className="space-y-2.5">
                {sim.defense_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </MagneticCard>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600 text-sm">Simulation not found</div>
        )}
      </div>
    </>
  )
}
