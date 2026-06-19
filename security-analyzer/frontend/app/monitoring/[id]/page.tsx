'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import MagneticCard from '@/components/ui/MagneticCard'
import ThreeBackground from '@/components/3d/ThreeBackground'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { api } from '@/lib/api'
import { MonitorResponse } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function MonitorDetailPage() {
  const params = useParams()
  const [monitor, setMonitor] = useState<MonitorResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        const data = await api.monitors.get(Number(params.id))
        setMonitor(data)
      } catch (err) {
        console.error('Failed to load monitor', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMonitor()
  }, [params.id])

  if (loading) {
    return (
      <div className="pt-28">
        <ThreeBackground />
        <LoadingSpinner text="Loading monitor..." />
      </div>
    )
  }

  if (!monitor) {
    return (
      <div className="pt-28 text-center text-gray-500">
        <ThreeBackground />
        <div className="relative z-10">
          <p className="text-gray-500">Monitor not found</p>
        </div>
      </div>
    )
  }

  const chartData = monitor.score_history.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score,
  }))

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" />
        <div className="orb" style={{ animationDelay: '-5s', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,255,136,0.08), transparent 70%)', top: 'auto', bottom: '0%', left: '10%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className={`w-2.5 h-2.5 rounded-full ${monitor.is_active ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]' : 'bg-gray-600'}`} />
          <div>
            <h1 className="text-2xl font-heading font-bold glow-text">{monitor.target}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Every {monitor.interval_hours}h &middot; {monitor.monitor_type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MagneticCard className="text-center" hud>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1.5">Current Score</div>
            <div className={`text-3xl font-heading font-bold ${
              (monitor.last_score || 0) >= 70 ? 'text-emerald-400' :
              (monitor.last_score || 0) >= 40 ? 'text-amber-400' : 'text-[#ff3366]'
            }`}>
              {monitor.last_score ?? '--'}
            </div>
          </MagneticCard>
          <MagneticCard className="text-center" hud>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1.5">Scans Run</div>
            <div className="text-3xl font-heading font-bold text-cyan-400">{monitor.score_history.length}</div>
          </MagneticCard>
          <MagneticCard className="text-center" hud>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1.5">Status</div>
            <div className={`text-lg font-heading font-bold ${monitor.is_active ? 'text-emerald-400' : 'text-gray-500'}`}>
              {monitor.is_active ? 'Active' : 'Inactive'}
            </div>
          </MagneticCard>
        </div>

        <MagneticCard hud glow>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-4">Score Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4a4a6a', fontSize: 11 }} dy={8} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#4a4a6a', fontSize: 11 }} dx={-4} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(12,12,36,0.95)',
                    border: '1px solid rgba(0,245,255,0.15)',
                    borderRadius: '12px',
                    color: '#e0e0ff',
                    fontSize: '13px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  labelStyle={{ color: '#9ca3af', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#00f5ff" strokeWidth={2} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-600 text-sm">
              No scan history yet. Waiting for first scan...
            </div>
          )}
        </MagneticCard>
      </div>
    </>
  )
}
