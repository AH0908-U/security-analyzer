'use client'
import MagneticCard from '@/components/ui/MagneticCard'
import ThreeBackground from '@/components/3d/ThreeBackground'
import AnimatedButton from '@/components/ui/AnimatedButton'

const settingsItems = [
  {
    title: 'API Keys',
    desc: 'Configure VirusTotal, PhishTank, and HIBP API keys for enhanced scanning',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    title: 'Alert Channels',
    desc: 'Set up Slack, email, or webhook notifications for security alerts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    title: 'Profile',
    desc: 'Manage your account settings and preferences',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function SettingsPage() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,245,255,0.1), transparent 70%)', top: 'auto', bottom: '10%', right: '5%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-heading font-bold glow-text mb-8">Settings</h1>
        <div className="space-y-4">
          {settingsItems.map((item, i) => (
            <MagneticCard key={i} hud className="cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-500 shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-sm text-gray-200">{item.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                <div className="ml-auto">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </MagneticCard>
          ))}
        </div>
        <p className="text-xs text-gray-700 mt-6 text-center">Settings page &mdash; features coming soon</p>
      </div>
    </>
  )
}
