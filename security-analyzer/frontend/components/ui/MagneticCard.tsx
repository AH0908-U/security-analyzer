'use client'
import { useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MagneticCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hud?: boolean
  glow?: boolean
  gradient?: boolean
}

export default function MagneticCard({ children, className = '', onClick, hud = false, glow = false, gradient = false }: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -12, y: x * 12 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setHover(false)
  }

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
      className={`relative rounded-2xl transition-all duration-200 ${gradient ? 'gradient-border' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: hover ? 'none' : 'transform 0.4s ease',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className={`p-6 h-full flex flex-col rounded-2xl backdrop-blur-[16px] border transition-all duration-300 ${
          glow && hover
            ? 'border-cyan-400/40 shadow-[0_0_40px_rgba(0,245,255,0.08)]'
            : glow
            ? 'border-cyan-400/15 shadow-[0_0_20px_rgba(0,245,255,0.03)]'
            : 'border-white/[0.06]'
        } ${
          gradient
            ? 'bg-transparent'
            : hover
            ? 'bg-[rgba(16,16,50,0.92)]'
            : 'bg-[rgba(11,11,40,0.8)]'
        }`}
        style={{
          backdropFilter: hover ? 'blur(20px)' : 'blur(16px)',
          WebkitBackdropFilter: hover ? 'blur(20px)' : 'blur(16px)',
        }}
      >
        {hud && (
          <>
            <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-400/20 pointer-events-none" />
            <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-400/20 pointer-events-none" />
            <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-400/20 pointer-events-none" />
            <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-400/20 pointer-events-none" />
          </>
        )}
        {children}
      </div>
    </motion.div>
  )
}
