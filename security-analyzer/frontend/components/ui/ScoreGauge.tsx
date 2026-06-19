'use client'
import { motion } from 'framer-motion'
import { RISK_COLORS, RiskLevel } from '@/lib/types'

interface ScoreGaugeProps {
  score: number
  riskLevel: RiskLevel
  size?: number
}

export default function ScoreGauge({ score, riskLevel, size = 180 }: ScoreGaugeProps) {
  const radius = size * 0.4
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = RISK_COLORS[riskLevel] || '#00ff88'

  const riskLabel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)

  const gradientId = 'score-gauge-gradient'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3366" />
            <stop offset="33%" stopColor="#ff6633" />
            <stop offset="66%" stopColor="#ffaa33" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="8"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-heading font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-[0.15em] font-medium">
          {riskLabel}
        </span>
      </div>
    </div>
  )
}
