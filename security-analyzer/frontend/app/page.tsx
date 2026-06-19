'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ScanInput from '@/components/scan/ScanInput'
import ScanResults from '@/components/scan/ScanResults'
import ThreeBackground from '@/components/3d/ThreeBackground'
import MagneticCard from '@/components/ui/MagneticCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import GlassCard from '@/components/ui/GlassCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { api } from '@/lib/api'
import { ScanResponse, ScanType } from '@/lib/types'
import Link from 'next/link'

const features = [
  {
    href: '/monitoring',
    title: 'Continuous Monitoring',
    desc: 'Auto-scan your assets daily. Track score trends and get alerts.',
    color: 'from-cyan-500 to-blue-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4v16h18M7 12l3-3 2 2 5-5" />
      </svg>
    ),
  },
  {
    href: '/remediation',
    title: 'AI Remediation',
    desc: 'Get step-by-step fix guides with ready-to-deploy code snippets.',
    color: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-7.29 7.29a2 2 0 01-2.83-2.83l7.29-7.29m5.66-5.66a5.5 5.5 0 107.78 7.78 5.5 5.5 0 00-7.78-7.78z" />
      </svg>
    ),
  },
  {
    href: '/simulation',
    title: 'Attack Simulation',
    desc: 'See how hackers exploit your vulnerabilities with realistic scenarios.',
    color: 'from-purple-500 to-pink-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

const stats = [
  { end: 12847, label: 'Scans Completed', suffix: '+' },
  { end: 99, label: 'Uptime', suffix: '%' },
  { end: 6, label: 'Threat Vectors', suffix: '' },
  { end: 250, label: 'Rules Engine', suffix: '+' },
]

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (type: ScanType, input: string) => {
    setLoading(true)
    setError(null)
    setScanResult(null)
    try {
      let result: ScanResponse
      switch (type) {
        case 'website':
          result = await api.scan.website(input)
          break
        case 'email':
          result = await api.scan.email(input)
          break
        case 'domain':
          result = await api.scan.domain(input)
          break
      }
      setScanResult(result!)
    } catch (err: any) {
      setError(err.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" />
        <div className="orb" style={{ animationDelay: '-4s', width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,247,0.1), transparent 70%)', top: 'auto', bottom: '-5%', left: '-10%' }} />
        <div className="orb" style={{ animationDelay: '-8s', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,51,102,0.08), transparent 70%)', top: '40%', left: '50%' }} />
      </div>
      <ThreeBackground score={scanResult?.overall_score} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
            AI-Powered Security Analysis
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-4">
            <span className="gradient-text">Sentinel</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Scan websites, emails, and domains for vulnerabilities.
            Get AI-powered fixes and realistic attack simulations.
          </p>
        </motion.div>

        {!scanResult && !loading && (
          <>
            <ScanInput onScan={handleScan} loading={loading} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <span className="text-[#ff3366] text-sm bg-[rgba(255,51,102,0.08)] px-4 py-2 rounded-xl border border-[rgba(255,51,102,0.2)]">
                  {error}
                </span>
              </motion.div>
            )}

            <div className="mt-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
                {stats.map((stat) => (
                  <GlassCard key={stat.label} hover={false}>
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} label={stat.label} />
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href={features[0].href} className="md:col-span-2 md:row-span-1">
                  <MagneticCard hud glow className="h-full">
                    <div className="flex flex-col h-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${features[0].color} flex items-center justify-center text-white shadow-lg mb-4`}>
                        {features[0].icon}
                      </div>
                      <h3 className="font-heading font-semibold text-gray-200 mb-1.5 text-lg">{features[0].title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed flex-1">{features[0].desc}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs text-cyan-400 font-medium">
                        Explore monitors
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </MagneticCard>
                </Link>
                <Link href={features[1].href}>
                  <MagneticCard hud glow className="h-full">
                    <div className="flex flex-col h-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${features[1].color} flex items-center justify-center text-white shadow-lg mb-4`}>
                        {features[1].icon}
                      </div>
                      <h3 className="font-heading font-semibold text-gray-200 mb-1.5">{features[1].title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed flex-1">{features[1].desc}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        View fixes
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </MagneticCard>
                </Link>
                <Link href={features[2].href}>
                  <MagneticCard hud glow className="h-full">
                    <div className="flex flex-col h-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${features[2].color} flex items-center justify-center text-white shadow-lg mb-4`}>
                        {features[2].icon}
                      </div>
                      <h3 className="font-heading font-semibold text-gray-200 mb-1.5">{features[2].title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed flex-1">{features[2].desc}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-medium">
                        Run simulation
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </MagneticCard>
                </Link>
              </div>
            </div>
          </>
        )}

        {loading && <LoadingSpinner text="Scanning with AI..." />}

        {scanResult && !loading && (
          <ScanResults result={scanResult} onNewScan={() => setScanResult(null)} />
        )}
      </div>
    </>
  )
}
