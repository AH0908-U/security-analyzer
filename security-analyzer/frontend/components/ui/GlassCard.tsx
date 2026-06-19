'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  glow?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', hover = true, gradient = false, glow = false, onClick }: GlassCardProps) {
  const Comp = onClick ? motion.button : motion.div

  return (
    <Comp
      onClick={onClick}
      className={`relative rounded-2xl transition-all duration-300 ${
        gradient ? 'gradient-border' : ''
      } ${glow ? 'border-cyan-400/15 shadow-[0_0_20px_rgba(0,245,255,0.03)]' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      whileTap={hover && onClick ? { scale: 0.99 } : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: 'rgba(11, 11, 40, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 245, 255, 0.12)',
      }}
    >
      <div className="p-6 h-full flex flex-col rounded-2xl">
        {children}
      </div>
    </Comp>
  )
}
