import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#040412',
          900: '#080818',
          850: '#0a0a1e',
          800: '#0c0c24',
          750: '#0f0f2e',
          700: '#1a1a3e',
          650: '#202045',
          600: '#252550',
          500: '#3a3a6a',
          accent: '#00f5ff',
          danger: '#ff3366',
          warning: '#ffaa33',
          success: '#00ff88',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scanline': 'scanlineMove 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 245, 255, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 245, 255, 0.7)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #080818 0%, #0c0c24 50%, #080818 100%)',
        'cyber-glow': 'radial-gradient(ellipse at center, rgba(0,245,255,0.06) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
