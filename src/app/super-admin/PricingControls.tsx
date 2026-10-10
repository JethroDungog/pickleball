'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Save, Copy, Loader2, Sparkles, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateCourt } from '@/actions/admin'
import type { Court } from '@/types'

interface PricingControlsProps {
  courts: Court[]
}

export default function PricingControls({ courts }: PricingControlsProps) {
  const [rates, setRates] = useState<Record<string, number>>(
    Object.fromEntries(courts.map((c) => [c.id, c.hourly_rate]))
  )
  const [bulkRate, setBulkRate] = useState<number>(25)
  const [isPending, startTransition] = useTransition()
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleRateChange = (courtId: string, value: number) => {
    setRates((prev) => ({ ...prev, [courtId]: Math.max(5, Math.min(150, value)) }))
    setSavedSuccess(false)
  }

  const applyBulkRate = () => {
    const updated: Record<string, number> = {}
    courts.forEach((c) => {
      updated[c.id] = bulkRate
    })
    setRates(updated)
    toast.success(`Set all courts to $${bulkRate}/hr`)
  }

  const handleSaveAll = () => {
    startTransition(async () => {
      try {
        let hasError = false
        for (const court of courts) {
          const newRate = rates[court.id]
          if (newRate !== court.hourly_rate) {
            const res = await updateCourt(court.id, { hourly_rate: newRate })
            if (!res.success) {
              hasError = true
              toast.error(`Failed to update ${court.name}`)
            }
          }
        }
        if (!hasError) {
          toast.success('All court pricing updated successfully!')
          setSavedSuccess(true)
        }
      } catch (err) {
        toast.error('Error saving pricing changes')
      }
    })
  }

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10 space-y-6">
      {/* Top Controls: Bulk Adjust */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-green" />
            Bulk Rate Adjustment
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Set a unified hourly rate across all active championship courts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="number"
              min={10}
              max={150}
              value={bulkRate}
              onChange={(e) => setBulkRate(Number(e.target.value))}
              className="w-24 pl-7 pr-2 py-1.5 rounded-lg bg-court-dark border border-white/15 text-sm text-white focus:outline-none focus:border-neon-green"
            />
          </div>
          <button
            type="button"
            onClick={applyBulkRate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Apply to All
          </button>
        </div>
      </div>

      {/* Per Court Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courts.map((court) => {
          const currentRate = rates[court.id] ?? court.hourly_rate
          return (
            <div
              key={court.id}
              className="p-4 rounded-xl bg-court-card border border-white/10 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: court.color_hex,
                      boxShadow: `0 0 8px ${court.color_hex}`,
                    }}
                  />
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{court.name}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {court.surface_type} · {court.is_indoor ? 'Indoor' : 'Outdoor'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="font-display font-bold text-xl"
                    style={{ color: court.color_hex }}
                  >
                    ${currentRate}
                  </span>
                  <span className="text-xs text-slate-500">/hr</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={currentRate}
                  onChange={(e) => handleRateChange(court.id, Number(e.target.value))}
                  className="w-full accent-neon-green cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$10/hr</span>
                  <span>$50/hr</span>
                  <span>$100/hr</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
                {[20, 25, 30, 35, 45].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleRateChange(court.id, preset)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      currentRate === preset
                        ? 'bg-neon-green text-black'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-neon-green text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#32e012] shadow-[0_0_20px_rgba(57,255,20,0.4)] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Pricing...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Pricing Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
