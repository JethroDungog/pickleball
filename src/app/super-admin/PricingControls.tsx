'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Save, Copy, Loader2, Sparkles, Check } from 'lucide-react'
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
  const [bulkRate, setBulkRate] = useState<number>(400)
  const [isPending, startTransition] = useTransition()
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleRateChange = (courtId: string, value: number) => {
    setRates((prev) => ({ ...prev, [courtId]: Math.max(100, Math.min(2000, value)) }))
    setSavedSuccess(false)
  }

  const applyBulkRate = () => {
    const updated: Record<string, number> = {}
    courts.forEach((c) => {
      updated[c.id] = bulkRate
    })
    setRates(updated)
    toast.success(`Set all courts to ₱${bulkRate}/hr`)
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
            } else {
              court.hourly_rate = newRate
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
    <div className="rounded-3xl bg-[#1c1c1e] p-6 border border-white/[0.08] space-y-6">
      {/* Top Controls: Bulk Adjust */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <div>
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#30d158]" />
            Bulk Rate Adjustment
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Set a unified hourly rate across all active championship courts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40">₱</span>
            <input
              type="number"
              min={100}
              max={2000}
              step={25}
              value={bulkRate}
              onChange={(e) => setBulkRate(Number(e.target.value))}
              className="w-28 pl-7 pr-3 py-2 rounded-xl bg-black border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <button
            type="button"
            onClick={applyBulkRate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors active:scale-95"
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
              className="p-5 rounded-2xl bg-[#2c2c2e]/50 border border-white/[0.06] flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: court.color_hex }}
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-white">{court.name}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">
                      {court.surface_type} · {court.is_indoor ? 'Indoor' : 'Outdoor'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="font-bold text-xl text-white"
                  >
                    ₱{currentRate}
                  </span>
                  <span className="text-xs text-white/40">/hr</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={25}
                  value={currentRate}
                  onChange={(e) => handleRateChange(court.id, Number(e.target.value))}
                  className="w-full accent-[#30d158] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>₱100/hr</span>
                  <span>₱500/hr</span>
                  <span>₱1,500/hr</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-white/40 uppercase tracking-wider mr-1">Presets:</span>
                {[350, 400, 500, 550, 750].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleRateChange(court.id, preset)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      currentRate === preset
                        ? 'bg-[#30d158] text-black'
                        : 'bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    ₱{preset}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isPending}
          className="px-7 py-3 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Updating Pricing…</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-[#30d158]" strokeWidth={2.5} />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-black" />
              <span>Save Pricing Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
