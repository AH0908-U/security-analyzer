'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import SeverityBadge from '@/components/ui/SeverityBadge'
import { Finding, Severity } from '@/lib/types'

interface FindingCardProps {
  finding: Finding
  index?: number
}

export default function FindingCard({ finding, index = 0 }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <GlassCard
        className="!p-0 cursor-pointer"
        hover={false}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <SeverityBadge severity={finding.severity as Severity} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-200">{finding.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{finding.description}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className={`text-xs font-mono font-bold ${
                finding.score_impact < 0
                  ? 'text-cyber-danger'
                  : finding.score_impact > 0
                  ? 'text-cyber-success'
                  : 'text-gray-500'
              }`}>
                {finding.score_impact > 0 ? '+' : ''}{finding.score_impact}
              </span>
              <motion.svg
                className="w-4 h-4 text-gray-600"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 border-t border-cyber-border/15 mx-4">
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">{finding.description}</p>
                {finding.compliance_mappings && Object.keys(finding.compliance_mappings).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(finding.compliance_mappings).map(([framework, ref]) => (
                      <span
                        key={framework}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-500 border border-cyber-border/15 font-mono"
                      >
                        {framework.toUpperCase()}: {ref as string}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}
