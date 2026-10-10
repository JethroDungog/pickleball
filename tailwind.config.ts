import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  safelist: [
    'bg-court-green',
    'bg-court-blue',
    'bg-court-clay',
    'bg-court-dark',
    'bg-court-surface',
    'bg-court-card',
    'border-court-border',
    'text-neon-green',
    'text-neon-yellow',
    'text-neon-pink',
    'text-neon-cyan',
    'shadow-neon-green',
    'shadow-neon-cyan',
    'shadow-glass',
    'animate-pulse-neon',
    'animate-slide-up',
    'animate-fade-in',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        court: {
          green: '#22c55e',
          blue: '#1d4ed8',
          clay: '#1a1007',
          dark: '#0d0d0d',
          surface: '#111111',
          card: '#161616',
          border: '#242424',
        },
        neon: {
          green: '#39ff14',
          yellow: '#ffe600',
          pink: '#ff006e',
          cyan: '#00f5ff',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          925: '#0a1120',
          950: '#020617',
        },
      },
      backgroundImage: {
        'dot-matrix': 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
        'court-lines':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='none' stroke='%2339ff1408' stroke-width='1'/%3E%3Cline x1='50' y1='0' x2='50' y2='100' stroke='%2339ff1408' stroke-width='0.5'/%3E%3Cline x1='0' y1='50' x2='100' y2='50' stroke='%2339ff1408' stroke-width='0.5'/%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(57,255,20,0.4), 0 0 10px rgba(57,255,20,0.2)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(57,255,20,0.8), 0 0 40px rgba(57,255,20,0.4)',
            opacity: '0.9',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(57,255,20,0.4)',
        'neon-cyan': '0 0 20px rgba(0,245,255,0.4)',
        'neon-pink': '0 0 20px rgba(255,0,110,0.4)',
        glass: '0 8px 32px rgba(0,0,0,0.6)',
        'inner-glow': 'inset 0 0 30px rgba(57,255,20,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
