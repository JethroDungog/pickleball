'use client'

import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle color theme"
      className="relative flex items-center justify-center w-8 h-8 rounded-full border transition-all active:scale-95 cursor-pointer bg-black/[0.04] dark:bg-white/[0.08] border-black/[0.08] dark:border-white/[0.12] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-white"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {theme === 'light' ? (
          <Sun size={15} className="text-[#ff9f0a] stroke-[2.2]" />
        ) : (
          <Moon size={14} className="text-[#0a84ff] stroke-[2.2]" />
        )}
      </motion.div>
    </button>
  )
}
