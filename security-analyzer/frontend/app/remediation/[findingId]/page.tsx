'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { RemediationResponse } from '@/lib/types'
import GlassCard from '@/components/ui/GlassCard'
import SeverityBadge from '@/components/ui/SeverityBadge'
import ThreeBackground from '@/components/3d/ThreeBackground'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Severity } from '@/lib/types'

export default function FindingDetailPage() {
  const params = useParams()
  const [remediation, setRemediation] = useState<RemediationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFix = async () => {
      try {
        const result = await api.remediation.generate({
          finding_type: params.findingId as string,
        })
        setRemediation(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFix()
  }, [params.findingId])

  if (loading) return <div className="pt-28"><ThreeBackground /><LoadingSpinner text="Loading fix..." /></div>
  if (!remediation) return <div className="pt-28 text-center text-gray-500"><ThreeBackground />Fix not found</div>

  return (
    <>
      <ThreeBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-16">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <SeverityBadge severity={remediation.severity as Severity} />
            <h1 className="text-xl font-heading font-bold text-gray-200">{remediation.finding_title}</h1>
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{remediation.fix_summary}</p>

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3.5">Steps</h3>
          <ol className="space-y-3 mb-6">
            {remediation.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-400">
                <span className="w-6 h-6 rounded-full bg-cyber-accent/8 text-cyber-accent flex items-center justify-center text-xs font-bold shrink-0 border border-cyber-accent/20">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>
    </>
  )
}
