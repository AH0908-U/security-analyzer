'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import AnimatedButton from '@/components/ui/AnimatedButton'
import { ScanType } from '@/lib/types'

interface ScanInputProps {
  onScan: (type: ScanType, input: string) => void
  loading?: boolean
}

const modes: { type: ScanType; label: string; placeholder: string; desc: string; icon: JSX.Element }[] = [
  {
    type: 'website',
    label: 'Website',
    placeholder: 'https://example.com',
    desc: 'SSL, headers, CSP, cookies',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    type: 'email',
    label: 'Email',
    placeholder: 'Paste email content here...',
    desc: 'Phishing, spoofing, links',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'domain',
    label: 'Domain',
    placeholder: 'example.com',
    desc: 'SPF, DKIM, DMARC, DNS',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
]

export default function ScanInput({ onScan, loading }: ScanInputProps) {
  const [activeMode, setActiveMode] = useState<ScanType>('website')
  const [input, setInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (input.trim()) {
      onScan(activeMode, input.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && activeMode !== 'email') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.eml') || file.type === 'message/rfc822' || file.type === 'text/plain')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
        setActiveMode('email')
      }
      reader.readAsText(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setInput(ev.target?.result as string)
        setActiveMode('email')
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-2xl transition-all duration-300 border border-cyan-400/15 shadow-[0_0_20px_rgba(0,245,255,0.03)]"
        style={{
          background: 'rgba(11, 11, 40, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="p-6">
          <div className="flex gap-1.5 mb-5 bg-white/[0.03] p-1.5 rounded-xl">
            {modes.map((mode) => (
              <button
                key={mode.type}
                onClick={() => setActiveMode(mode.type)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeMode === mode.type
                    ? 'bg-cyan-400/12 text-cyan-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                }`}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeMode === 'email' ? (
                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                    isDragOver
                      ? 'border-cyan-400/60 bg-cyan-400/5'
                      : 'border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste email content here, or drop a .eml file..."
                    className="w-full bg-transparent text-gray-200 placeholder-gray-600 rounded-xl p-4 min-h-[180px] resize-y outline-none font-mono text-sm leading-relaxed"
                    onKeyDown={handleKeyDown}
                  />
                  <div className="flex items-center gap-2 px-4 pb-3 text-xs text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Drop .eml file</span>
                    <span className="text-gray-700">or</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      browse
                    </button>
                    <input ref={fileInputRef} type="file" accept=".eml,.txt" className="hidden" onChange={handleFileSelect} />
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={modes.find(m => m.type === activeMode)?.placeholder || 'Enter target...'}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-gray-200 placeholder-gray-600 outline-none transition-all duration-200 focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.08)] group-hover:border-white/[0.15]"
                    />
                  </div>
                  <AnimatedButton onClick={handleSubmit} disabled={loading || !input.trim()} size="lg" glowOnHover>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Scanning
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Scan
                      </span>
                    )}
                  </AnimatedButton>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
