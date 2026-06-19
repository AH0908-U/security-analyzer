'use client'
import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
  glowOnHover?: boolean
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  glowOnHover = true,
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all overflow-hidden select-none'

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-5 py-3 text-sm gap-2',
    lg: 'px-7 py-4 text-base gap-2.5',
  }

  const variantStyles = {
    primary: 'bg-gradient-to-r from-cyber-accent to-cyan-400 text-cyber-950 font-semibold',
    secondary: 'glass text-gray-200 hover:text-white hover:border-cyber-accent/40',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/[0.06]',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
    onClick?.()
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${glowOnHover && variant === 'primary' && !disabled ? 'hover:shadow-lg hover:shadow-cyber-accent/25' : ''} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}
      {children}
    </motion.button>
  )
}
