'use client'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import ScoreGauge from '@/components/ui/ScoreGauge'
import FindingCard from '@/components/scan/FindingCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import { ScanResponse, RiskLevel } from '@/lib/types'
import Link from 'next/link'

interface ScanResultsProps {
  result: ScanResponse
  onNewScan: () => void
}

export default function ScanResults({ result, onNewScan }: ScanResultsProps) {
  const severityBars = (['critical', 'high', 'medium', 'low', 'info'] as const).map((sev) => ({
    key: sev,
    count: result.severity_breakdown[sev] || 0,
    barColor:
      sev === 'critical' ? 'bg-[#ff3366]' :
      sev === 'high' ? 'bg-orange-500' :
      sev === 'medium' ? 'bg-amber-400' :
      sev === 'low' ? 'bg-yellow-400' : 'bg-cyan-400',
    glowColor:
      sev === 'critical' ? 'rgba(255,51,102,0.3)' :
      sev === 'high' ? 'rgba(255,102,51,0.3)' :
      sev === 'medium' ? 'rgba(255,170,51,0.3)' :
      sev === 'low' ? 'rgba(255,221,68,0.2)' : 'rgba(0,245,255,0.3)',
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold glow-text">Scan Results</h2>
          <p className="text-xs text-gray-600 mt-0.5">{result.target}</p>
        </div>
        <AnimatedButton variant="ghost" onClick={onNewScan} size="sm">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Scan
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="flex flex-col items-center justify-center md:col-span-1" glow>
          <ScoreGauge
            score={result.overall_score}
            riskLevel={result.risk_level as RiskLevel}
          />
          <p className="text-xs text-gray-600 mt-3 text-center">
            {result.findings_count} findings &middot; {result.severity_breakdown.critical || 0} critical
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-4">
            Severity Breakdown
          </h3>
          <div className="space-y-2.5">
            {severityBars.map((sev, i) => (
              <div key={sev.key} className="flex items-center gap-3">
                <span className="text-xs w-16 text-gray-600 uppercase tracking-wide font-medium">{sev.key}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${sev.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, sev.count * 20)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ boxShadow: `0 0 8px ${sev.glowColor}` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right font-mono font-medium">
                  {sev.count}
                </span>
              </div>
            ))}
          </div>

          {result.top_improvements.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-[0.12em] mb-3">
                Top Improvements
              </h4>
              <div className="space-y-2">
                {result.top_improvements.slice(0, 3).map((imp, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 mt-1 shrink-0" />
                    {imp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <Link href={`/monitoring/new?target=${encodeURIComponent(result.target)}`}>
          <AnimatedButton variant="secondary" size="sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Monitor This
          </AnimatedButton>
        </Link>
        <Link href={`/remediation?scanId=${result.scan_id}`}>
          <AnimatedButton variant="secondary" size="sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-7.29 7.29a2 2 0 01-2.83-2.83l7.29-7.29m5.66-5.66a5.5 5.5 0 107.78 7.78 5.5 5.5 0 00-7.78-7.78z" />
            </svg>
            View Fixes
          </AnimatedButton>
        </Link>
        <Link href={`/simulation/new?target=${encodeURIComponent(result.target)}`}>
          <AnimatedButton variant="secondary" size="sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simulate Attack
          </AnimatedButton>
        </Link>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">
          All Findings ({result.findings.length})
        </h3>
        <div className="space-y-2">
          {result.findings.map((finding, i) => (
            <FindingCard key={i} finding={finding} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
