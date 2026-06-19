import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sentinel - AI Security Posture Analyzer',
  description: 'Scan websites, emails, and domains for security vulnerabilities. Get AI-powered fixes and personalized attack simulations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[#07071a] antialiased">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,255,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
        <Navbar />
        <main className="relative z-10">
          {children}
        </main>
        <div id="three-container" className="fixed inset-0 z-0 pointer-events-none" />
      </body>
    </html>
  )
}
