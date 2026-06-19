'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GlassCard from '@/components/ui/GlassCard'
import MagneticCard from '@/components/ui/MagneticCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import ThreeBackground from '@/components/3d/ThreeBackground'
import { api } from '@/lib/api'

function NewMonitorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [target, setTarget] = useState(searchParams.get('target') || '')
  const [type, setType] = useState<'website' | 'domain'>('website')
  const [interval, setInterval] = useState(24)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.monitors.create({ target, monitor_type: type, interval_hours: interval })
      router.push('/monitoring')
    } catch (err) {
      console.error('Failed to create monitor', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" />
        <div className="orb" style={{ animationDelay: '-4s', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,255,136,0.08), transparent 70%)', top: 'auto', bottom: '0%', left: '20%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold glow-text mb-2">New Monitor</h1>
          <p className="text-gray-500 text-sm">Set up automated recurring security scans</p>
        </div>

        <form onSubmit={handleSubmit}>
          <MagneticCard hud glow className="space-y-6 !p-0">
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target URL/Domain</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 outline-none transition-all duration-200 focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.08)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2.5">Type</label>
                <div className="flex gap-3">
                  {(['website', 'domain'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        type === t
                          ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                          : 'bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:border-white/[0.12]'
                      }`}
                    >
                      {t === 'website' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 12H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {t === 'website' ? 'Website' : 'Domain'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2.5">Scan Interval</label>
                <div className="flex gap-2">
                  {[
                    { value: 1, label: '1h' },
                    { value: 6, label: '6h' },
                    { value: 12, label: '12h' },
                    { value: 24, label: 'Daily' },
                    { value: 168, label: 'Weekly' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setInterval(opt.value)}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        interval === opt.value
                          ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                          : 'bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:border-white/[0.12]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatedButton type="submit" disabled={loading || !target.trim()} className="w-full">
                {loading ? 'Creating...' : 'Start Monitoring'}
              </AnimatedButton>
            </div>
          </MagneticCard>
        </form>
      </div>
    </>
  )
}

export default function NewMonitorPage() {
  return (
    <Suspense fallback={<div className="pt-28 text-center text-gray-500 text-sm">Loading...</div>}>
      <NewMonitorForm />
    </Suspense>
  )
}
