'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function LiveClock() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-court-card border border-white/10 text-xs font-mono text-slate-300">
      <Clock className="w-3.5 h-3.5 text-neon-cyan" />
      <span>{time || '--:--:-- --'}</span>
    </div>
  )
}
