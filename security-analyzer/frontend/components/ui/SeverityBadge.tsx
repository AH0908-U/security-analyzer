import { Severity, SEVERITY_COLORS } from '@/lib/types'

interface SeverityBadgeProps {
  severity: Severity
  label?: string
}

export default function SeverityBadge({ severity, label }: SeverityBadgeProps) {
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.info
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 8px ${colors.border}`,
      }}
    >
      {label || severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}
