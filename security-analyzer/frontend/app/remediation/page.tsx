'use client'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import GlassCard from '@/components/ui/GlassCard'
import MagneticCard from '@/components/ui/MagneticCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import SeverityBadge from '@/components/ui/SeverityBadge'
import ThreeBackground from '@/components/3d/ThreeBackground'
import { api } from '@/lib/api'
import { RemediationResponse, Severity } from '@/lib/types'

const findingTypes = [
  { id: 'missing_spf', label: 'Missing SPF Record', severity: 'critical', category: 'spf' },
  { id: 'missing_dkim', label: 'Missing DKIM Record', severity: 'high', category: 'email' },
  { id: 'missing_dmarc', label: 'Missing DMARC Policy', severity: 'high', category: 'email' },
  { id: 'no_hsts', label: 'Missing HSTS Header', severity: 'medium', category: 'headers' },
  { id: 'no_csp', label: 'Missing CSP Header', severity: 'high', category: 'headers' },
  { id: 'weak_ssl', label: 'Weak SSL/TLS Config', severity: 'medium', category: 'ssl' },
  { id: 'missing_x_frame_options', label: 'Missing X-Frame-Options', severity: 'medium', category: 'headers' },
  { id: 'generic', label: 'General Security Hardening', severity: 'info', category: 'general' },
]

function RemediationContent() {
  const searchParams = useSearchParams()
  const scanId = searchParams.get('scanId')

  const [selectedType, setSelectedType] = useState(findingTypes[0].id)
  const [remediation, setRemediation] = useState<RemediationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const type = findingTypes.find(t => t.id === selectedType)
      const result = await api.remediation.generate({
        finding_type: selectedType,
        category: type?.category || '',
        title: type?.label || '',
        severity: type?.severity || 'medium',
      })
      setRemediation(result)
    } catch (err) {
      console.error('Failed to generate fix', err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSnippet(code)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" />
        <div className="orb" style={{ animationDelay: '-6s', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,255,136,0.08), transparent 70%)', top: '60%', left: '-5%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold glow-text mb-2">AI Remediation</h1>
          <p className="text-gray-500 text-sm">Get step-by-step fix instructions with ready-to-use code snippets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <MagneticCard hud glow>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3.5">Finding Type</h3>
              <div className="space-y-1">
                {findingTypes.map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => { setSelectedType(ft.id); setRemediation(null) }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      selectedType === ft.id
                        ? 'bg-cyan-400/8 text-cyan-400 border border-cyan-400/25'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SeverityBadge severity={ft.severity as Severity} />
                      <span className="truncate">{ft.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <AnimatedButton onClick={handleGenerate} disabled={loading} className="w-full mt-4">
                {loading ? 'Generating...' : 'Generate Fix'}
              </AnimatedButton>
            </MagneticCard>
          </div>

          <div className="md:col-span-2">
            {remediation ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <MagneticCard hud glow>
                  <div className="flex items-start gap-3 mb-4">
                    <SeverityBadge severity={remediation.severity as Severity} />
                    <div>
                      <h3 className="font-heading font-semibold text-gray-200">{remediation.finding_title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{remediation.finding_description}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">{remediation.fix_summary}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {remediation.estimated_time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {remediation.difficulty}
                    </span>
                  </div>
                  {Object.keys(remediation.compliance_mappings).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/[0.06]">
                      {Object.entries(remediation.compliance_mappings).map(([framework, ref]) => (
                        <span key={framework} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-500 border border-white/[0.08] font-mono">
                          {framework.toUpperCase()}: {ref as string}
                        </span>
                      ))}
                    </div>
                  )}
                </MagneticCard>

                <MagneticCard hud>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-4">
                    Step-by-Step Guide
                  </h3>
                  <ol className="space-y-3">
                    {remediation.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                        <span className="w-6 h-6 rounded-full bg-cyan-400/8 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 border border-cyan-400/20">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </MagneticCard>

                {remediation.code_snippets.length > 0 && (
                  <MagneticCard hud>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-4">
                      Ready-to-Deploy Configs
                    </h3>
                    <div className="space-y-3">
                      {remediation.code_snippets.map((snippet, i) => (
                        <div key={i} className="rounded-xl bg-[rgba(4,4,18,0.8)] border border-white/[0.06] overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-[rgba(10,10,30,0.5)] border-b border-white/[0.06]">
                            <span className="text-xs text-gray-500">{snippet.label}</span>
                            <button
                              onClick={() => copyCode(snippet.code)}
                              className="text-xs text-cyan-400 hover:underline font-medium"
                            >
                              {copiedSnippet === snippet.code ? (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Copied!
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy
                                </span>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {snippet.code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </MagneticCard>
                )}

                {remediation.resources.length > 0 && (
                  <MagneticCard hud>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">
                      Resources
                    </h3>
                    <div className="space-y-1.5">
                      {remediation.resources.map((r, i) => (
                        <a key={i} href={r} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-cyan-400 hover:underline truncate">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {r}
                        </a>
                      ))}
                    </div>
                  </MagneticCard>
                )}
              </motion.div>
            ) : (
              <MagneticCard className="text-center py-20" hud>
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/8 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-7.29 7.29a2 2 0 01-2.83-2.83l7.29-7.29m5.66-5.66a5.5 5.5 0 107.78 7.78 5.5 5.5 0 00-7.78-7.78z" />
                  </svg>
                </div>
                <h3 className="text-base font-heading font-semibold text-gray-400 mb-2">Select a finding type</h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  Choose a vulnerability from the sidebar, then click Generate Fix
                </p>
              </MagneticCard>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function RemediationPage() {
  return (
    <Suspense fallback={<div className="pt-28 text-center text-gray-500 text-sm">Loading...</div>}>
      <RemediationContent />
    </Suspense>
  )
}
