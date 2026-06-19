import { Finding, ScanResponse, MonitorResponse, SimulationResponse, RemediationResponse } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `API error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  scan: {
    website: (url: string): Promise<ScanResponse> =>
      fetchAPI('/scan/website', { method: 'POST', body: JSON.stringify({ url }) }),
    email: (email_text: string): Promise<ScanResponse> =>
      fetchAPI('/scan/email', { method: 'POST', body: JSON.stringify({ email_text }) }),
    domain: (domain: string): Promise<ScanResponse> =>
      fetchAPI('/scan/domain', { method: 'POST', body: JSON.stringify({ domain }) }),
  },
  monitors: {
    list: (): Promise<MonitorResponse[]> => fetchAPI('/monitors'),
    get: (id: number): Promise<MonitorResponse> => fetchAPI(`/monitors/${id}`),
    create: (data: { target: string; monitor_type: string; interval_hours?: number }): Promise<MonitorResponse> =>
      fetchAPI('/monitors', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => fetchAPI(`/monitors/${id}`, { method: 'DELETE' }),
  },
  remediation: {
    generate: (data: { finding_type: string; category?: string; title?: string; severity?: string }): Promise<RemediationResponse> =>
      fetchAPI('/remediation/generate', { method: 'POST', body: JSON.stringify(data) }),
    types: () => fetchAPI('/remediation/finding-types'),
  },
  simulation: {
    generate: (data: { target: string; attack_type?: string; difficulty?: string; findings?: Finding[] }): Promise<SimulationResponse> =>
      fetchAPI('/simulation/generate', { method: 'POST', body: JSON.stringify(data) }),
    history: (): Promise<SimulationResponse[]> => fetchAPI('/simulation/history'),
    attackTypes: () => fetchAPI('/simulation/attack-types'),
  },
}
