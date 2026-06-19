'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import MagneticCard from '@/components/ui/MagneticCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import ThreeBackground from '@/components/3d/ThreeBackground'
import { api } from '@/lib/api'
import { SimulationResponse } from '@/lib/types'

function NewSimulationForm() {
  const searchParams = useSearchParams()
  const prefillTarget = searchParams.get('target') || ''

  const [target, setTarget] = useState(prefillTarget)
  const [attackType, setAttackType] = useState('phishing_email')
  const [difficulty, setDifficulty] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResponse | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await api.simulation.generate({
        target: target,
        attack_type: attackType,
        difficulty: difficulty,
      })
      setResult(data)
    } catch (err) {
      console.error('Simulation failed', err)
    } finally {
      setLoading(false)
    }
  }

  const attackOptions = [
    {
      value: 'phishing_email',
      label: 'Phishing Email',
      desc: 'Generic mass-targeted phishing campaign',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-600',
    },
    {
      value: 'spear_phish',
      label: 'Spear Phishing',
      desc: 'Targeted attack on a specific person',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600',
    },
    {
      value: 'bec',
      label: 'BEC Attack',
      desc: 'Business Email Compromise scenario',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-red-500 to-orange-600',
    },
  ]

  const difficultyOptions = [
    { value: 'basic', label: 'Basic', desc: 'Simple phishing template' },
    { value: 'advanced', label: 'Advanced', desc: 'Multi-vector attack' },
    { value: 'realistic', label: 'Realistic', desc: 'Full social engineering' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,247,0.12), transparent 70%)', top: '-5%', right: '10%' }} />
        <div className="orb" style={{ animationDelay: '-6s', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,51,102,0.08), transparent 70%)', top: 'auto', bottom: '0%', left: '20%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold glow-text mb-2">New Attack Simulation</h1>
          <p className="text-gray-500 text-sm">Generate a realistic attack scenario based on your vulnerabilities</p>
        </div>

        {!result ? (
          <MagneticCard hud glow className="space-y-6 !p-0">
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target (URL, domain, or email)</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., example.com or a phishing email"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 outline-none transition-all duration-200 focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.08)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2.5">Attack Type</label>
                  <div className="space-y-2">
                    {attackOptions.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setAttackType(type.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                          attackType === type.value
                            ? 'bg-cyan-400/8 border border-cyan-400/30'
                            : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={attackType === type.value ? 'text-cyan-400' : 'text-gray-500'}>
                            {type.icon}
                          </span>
                          <div>
                            <div className="font-medium text-sm text-gray-200">{type.label}</div>
                            <div className="text-xs text-gray-600 mt-0.5">{type.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2.5">Difficulty</label>
                  <div className="space-y-2">
                    {difficultyOptions.map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() => setDifficulty(diff.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                          difficulty === diff.value
                            ? 'bg-cyan-400/8 border border-cyan-400/30'
                            : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-200">{diff.label}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{diff.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatedButton onClick={handleGenerate} disabled={loading || !target.trim()} className="w-full">
                {loading ? 'Generating Attack Scenario...' : 'Generate Simulation'}
              </AnimatedButton>
            </div>
          </MagneticCard>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <MagneticCard className="text-center" hud glow>
              <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">Estimated Click-through Risk</div>
              <div className={`text-5xl font-heading font-bold ${
                result.risk_percentage >= 70 ? 'text-[#ff3366]' :
                result.risk_percentage >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {result.risk_percentage}%
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.04] mt-5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-[#ff3366]"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.risk_percentage}%` }}
                  transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </MagneticCard>

            {result.rendered_email && (
              <MagneticCard hud glow>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-4">Simulated Phishing Email</h3>
                <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/[0.08]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-[#ff3366] flex items-center justify-center text-xs font-bold text-white">
                      {(result.rendered_email.from || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 truncate">
                        {(result.rendered_email.from || '').replace(/<[^>]+>/g, '').trim()}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{result.rendered_email.from || ''}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-heading font-semibold text-gray-200 mb-3">{result.rendered_email.subject}</p>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{result.rendered_email.body}</p>
                    {result.rendered_email.links && result.rendered_email.links.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-[rgba(255,51,102,0.08)] border border-[rgba(255,51,102,0.2)]">
                        <p className="text-xs text-[#ff3366] font-mono break-all">
                          Links to: {result.rendered_email.links.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </MagneticCard>
            )}

            <MagneticCard hud>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">How This Attack Works</h3>
              <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{result.scenario_text}</p>
            </MagneticCard>

            <MagneticCard hud>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">How to Defend</h3>
              <div className="space-y-2.5">
                {result.defense_tips.map((tip, i) => (
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

            <div className="flex gap-3">
              <AnimatedButton variant="secondary" onClick={() => setResult(null)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Simulation
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}

export default function NewSimulationPage() {
  return (
    <Suspense fallback={<div className="pt-28 text-center text-gray-500 text-sm">Loading...</div>}>
      <NewSimulationForm />
    </Suspense>
  )
}
