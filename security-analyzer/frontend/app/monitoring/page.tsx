'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GlassCard from '@/components/ui/GlassCard'
import MagneticCard from '@/components/ui/MagneticCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import ThreeBackground from '@/components/3d/ThreeBackground'
import { api } from '@/lib/api'
import { MonitorResponse } from '@/lib/types'

export default function MonitoringPage() {
  const [monitors, setMonitors] = useState<MonitorResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMonitors = async () => {
    try {
      const data = await api.monitors.list()
      setMonitors(data)
    } catch (err) {
      console.error('Failed to load monitors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMonitors() }, [])

  const handleDelete = async (id: number) => {
    await api.monitors.delete(id)
    fetchMonitors()
  }

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" />
        <div className="orb" style={{ animationDelay: '-4s', width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,247,0.1), transparent 70%)', top: 'auto', bottom: '-5%', left: '-10%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold glow-text">Monitoring</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Track security scores over time with automatic rescanning</p>
          </div>
          <Link href="/monitoring/new">
            <AnimatedButton>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Monitor
            </AnimatedButton>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600 text-sm">Loading monitors...</div>
        ) : monitors.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/8 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-semibold text-gray-300 mb-2">No monitors yet</h3>
            <p className="text-gray-500 text-sm mb-6">Set up continuous monitoring for your websites and domains</p>
            <Link href="/monitoring/new">
              <AnimatedButton>Set Up Monitoring</AnimatedButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monitors.map((monitor, i) => (
              <motion.div
                key={monitor.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link href={`/monitoring/${monitor.id}`}>
                  <MagneticCard hud glow className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${monitor.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-gray-600'}`} />
                          <h3 className="font-heading font-semibold text-sm text-gray-200">{monitor.target}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5">
                          Every {monitor.interval_hours}h &middot; {monitor.monitor_type}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); handleDelete(monitor.id) }}
                        className="text-gray-600 hover:text-[#ff3366] transition-colors text-xs px-2 py-1 rounded-lg hover:bg-[rgba(255,51,102,0.1)]"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {monitor.last_score !== null ? (
                        <>
                          <div className={`text-2xl font-heading font-bold ${
                            (monitor.last_score || 0) >= 70 ? 'text-emerald-400' :
                            (monitor.last_score || 0) >= 40 ? 'text-amber-400' : 'text-[#ff3366]'
                          }`}>
                            {monitor.last_score}
                          </div>
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#ff3366] via-[#ffaa33] to-[#00ff88]"
                                initial={{ width: 0 }}
                                animate={{ width: `${monitor.last_score || 0}%` }}
                                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-600">Waiting for first scan...</span>
                      )}
                    </div>

                    {monitor.score_history.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <p className="text-xs text-gray-600 mb-2.5 font-medium">
                          Last {Math.min(monitor.score_history.length, 10)} scans
                        </p>
                        <div className="flex items-end gap-0.5 h-14">
                          {monitor.score_history.slice(-10).map((point, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm transition-all duration-200 hover:opacity-80"
                              style={{
                                height: `${(point.score / 100) * 100}%`,
                                background: point.score >= 70
                                  ? 'linear-gradient(to top, #00ff88, rgba(0,255,136,0.4))'
                                  : point.score >= 40
                                  ? 'linear-gradient(to top, #ffaa33, rgba(255,170,51,0.4))'
                                  : 'linear-gradient(to top, #ff3366, rgba(255,51,102,0.4))',
                                opacity: 0.4 + (i / 10) * 0.6,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
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
