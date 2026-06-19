'use client'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ text = 'Analyzing...', size = 'md' }: LoadingSpinnerProps) {
  const dimensions = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' }
  const innerSizes = { sm: ['inset-0', 'inset-1', 'inset-2'], md: ['inset-0', 'inset-2', 'inset-4'], lg: ['inset-0', 'inset-3', 'inset-6'] }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12">
      <div className={`relative ${dimensions[size]}`}>
        <motion.div
          className={`absolute ${innerSizes[size][0]} rounded-full border-2 border-transparent border-t-cyber-accent`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute ${innerSizes[size][1]} rounded-full border-2 border-transparent border-t-cyber-danger`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute ${innerSizes[size][2]} rounded-full border-2 border-transparent border-t-cyber-success`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && (
        <motion.p
          className="text-sm text-gray-500 font-medium tracking-wide"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
