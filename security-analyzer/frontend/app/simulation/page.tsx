'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GlassCard from '@/components/ui/GlassCard'
import MagneticCard from '@/components/ui/MagneticCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import ThreeBackground from '@/components/3d/ThreeBackground'
import { api } from '@/lib/api'
import { SimulationResponse } from '@/lib/types'

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<SimulationResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSims = async () => {
      try {
        const data = await api.simulation.history()
        setSimulations(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSims()
  }, [])

  const attackIcons: Record<string, JSX.Element> = {
    phishing_email: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    spear_phish: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    bec: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  }

  const attackColors: Record<string, string> = {
    phishing_email: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    spear_phish: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    bec: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,247,0.12), transparent 70%)', top: '-5%', right: '10%' }} />
        <div className="orb" style={{ animationDelay: '-6s', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,51,102,0.08), transparent 70%)', top: 'auto', bottom: '0%', left: '20%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold glow-text">Attack Simulations</h1>
            <p className="text-gray-500 text-sm mt-1.5">See how hackers would exploit your vulnerabilities</p>
          </div>
          <Link href="/simulation/new">
            <AnimatedButton>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Simulation
            </AnimatedButton>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600 text-sm">Loading simulations...</div>
        ) : simulations.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/8 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-semibold text-gray-300 mb-2">No simulations yet</h3>
            <p className="text-gray-500 text-sm mb-6">Run a scan first, then simulate attacks against your findings</p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <AnimatedButton variant="secondary">Scan a Target</AnimatedButton>
              </Link>
              <Link href="/simulation/new">
                <AnimatedButton>Start Simulation</AnimatedButton>
              </Link>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulations.map((sim, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link href={`/simulation/${sim.id}`}>
                  <MagneticCard hud glow className="h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${attackColors[sim.attack_type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                            {attackIcons[sim.attack_type]}
                            {sim.attack_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">{sim.difficulty}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-2 font-medium">{sim.target}</p>
                      </div>
                      <div className={`text-2xl font-heading font-bold ${
                        sim.risk_percentage >= 70 ? 'text-[#ff3366]' :
                        sim.risk_percentage >= 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {sim.risk_percentage}%
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{sim.scenario_text}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sim.defense_tips.slice(0, 2).map((tip, j) => (
                        <span key={j} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-500 border border-white/[0.08]">
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {tip.length > 40 ? tip.slice(0, 40) + '...' : tip}
                        </span>
                      ))}
                    </div>
                  </MagneticCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
