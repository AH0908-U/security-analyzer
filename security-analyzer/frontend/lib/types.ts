export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical'
export type ScanType = 'website' | 'email' | 'domain'
export type MonitorType = 'website' | 'domain'

export const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(255, 51, 102, 0.15)', text: '#ff3366', border: 'rgba(255, 51, 102, 0.4)' },
  high: { bg: 'rgba(255, 102, 51, 0.15)', text: '#ff6633', border: 'rgba(255, 102, 51, 0.4)' },
  medium: { bg: 'rgba(255, 170, 51, 0.15)', text: '#ffaa33', border: 'rgba(255, 170, 51, 0.4)' },
  low: { bg: 'rgba(255, 221, 68, 0.1)', text: '#ffdd44', border: 'rgba(255, 221, 68, 0.3)' },
  info: { bg: 'rgba(0, 245, 255, 0.1)', text: '#00f5ff', border: 'rgba(0, 245, 255, 0.3)' },
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#00ff88',
  low: '#88dd44',
  medium: '#ffaa33',
  high: '#ff6633',
  critical: '#ff3366',
}

export const SCAN_MODE_ICONS: Record<ScanType, { icon: string; label: string; desc: string }> = {
  website: { icon: '🌐', label: 'Website', desc: 'SSL, headers, CSP, cookies, tech stack' },
  email: { icon: '📧', label: 'Email', desc: 'Phishing, spoofing, links, urgency detection' },
  domain: { icon: '🔐', label: 'Domain', desc: 'SPF, DKIM, DMARC, DNS security' },
}

export interface Finding {
  category: string
  severity: string
  title: string
  description: string
  score_impact: number
  finding_type?: string
  compliance_mappings?: Record<string, string>
}

export interface ScanResponse {
  scan_id?: number
  scan_type: string
  target: string
  overall_score: number
  risk_level: string
  findings_count: number
  findings: Finding[]
  severity_breakdown: Record<string, number>
  top_improvements: string[]
  fixes?: any[]
}

export interface MonitorResponse {
  id: number
  target: string
  monitor_type: string
  interval_hours: number
  is_active: boolean
  last_score: number | null
  score_history: { score: number; date: string }[]
  created_at: string
}

export interface SimulationResponse {
  id?: number
  target: string
  attack_type: string
  difficulty: string
  risk_percentage: number
  scenario_text: string
  rendered_email: Record<string, any>
  exploited_vulns: Finding[]
  defense_tips: string[]
}

export interface RemediationResponse {
  finding_title: string
  finding_description: string
  severity: string
  fix_summary: string
  steps: string[]
  code_snippets: { language: string; label: string; code: string }[]
  estimated_time: string
  difficulty: string
  resources: string[]
  compliance_mappings: Record<string, string>
}
