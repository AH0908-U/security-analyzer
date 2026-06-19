'use client'
import MagneticCard from '@/components/ui/MagneticCard'
import ThreeBackground from '@/components/3d/ThreeBackground'
import Link from 'next/link'
import AnimatedButton from '@/components/ui/AnimatedButton'

export default function HistoryPage() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb" />
        <div className="orb" style={{ animationDelay: '-5s', width: 350, height: 350, background: 'radial-gradient(circle, rgba(123,47,247,0.08), transparent 70%)', top: 'auto', bottom: '0%', left: '10%' }} />
      </div>
      <ThreeBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-heading font-bold glow-text mb-8">Scan History</h1>
        <MagneticCard className="text-center py-20" hud>
          <div className="w-14 h-14 rounded-2xl bg-cyan-400/8 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">History will appear here after you run some scans</p>
          <div className="mt-6">
            <Link href="/">
              <AnimatedButton variant="secondary" size="sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Run a Scan
              </AnimatedButton>
            </Link>
          </div>
        </MagneticCard>
      </div>
    </>
  )
}
