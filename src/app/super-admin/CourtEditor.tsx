'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Check,
  X,
  Pencil,
  ChevronDown,
  Zap,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { updateCourt, toggleCourtActive, addCourt } from '@/actions/admin'
import type { Court, SurfaceType, NewCourtInput } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#39ff14', // neon green
  '#00f5ff', // neon cyan
  '#ff006e', // neon pink
  '#ffe600', // neon yellow
  '#a855f7', // purple
  '#f97316', // orange
]

const SURFACE_TYPES: SurfaceType[] = ['hard', 'clay', 'grass', 'synthetic']

// ── Toggle Switch ─────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60',
        checked ? 'bg-neon-green' : 'bg-court-border',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      <motion.span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-court-dark shadow-lg"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ── Rate Editor ───────────────────────────────────────────────────────────────

interface RateEditorProps {
  courtId: string
  initialRate: number
  onSaved: (newRate: number) => void
}

function RateEditor({ courtId, initialRate, onSaved }: RateEditorProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(initialRate))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const save = async () => {
    const rate = parseFloat(value)
    if (isNaN(rate) || rate < 0) {
      toast.error('Enter a valid rate')
      return
    }
    setSaving(true)
    const res = await updateCourt(courtId, { hourly_rate: rate })
    setSaving(false)
    if (res.success) {
      toast.success('Rate updated')
      onSaved(rate)
      setEditing(false)
    } else {
      toast.error(res.error ?? 'Failed to update rate')
    }
  }

  const cancel = () => {
    setValue(String(initialRate))
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="group flex items-center gap-1.5 text-neon-green font-mono font-semibold text-sm hover:text-neon-cyan transition-colors"
      >
        ₱{initialRate}/hr
        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400 text-sm">₱</span>
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') cancel()
        }}
        className="w-20 px-2 py-1 rounded-lg bg-court-card border border-neon-green/40 text-white text-sm font-mono
                   focus:outline-none focus:ring-1 focus:ring-neon-green/60"
        min={0}
        step={0.5}
      />
      <button
        onClick={save}
        disabled={saving}
        className="p-1 rounded-lg bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={cancel}
        className="p-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Add Court Modal ───────────────────────────────────────────────────────────

interface AddCourtModalProps {
  onClose: () => void
  onAdded: (court: Court) => void
}

function AddCourtModal({ onClose, onAdded }: AddCourtModalProps) {
  const [form, setForm] = useState<NewCourtInput>({
    name: '',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 30,
    color_hex: PRESET_COLORS[0],
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof NewCourtInput, string>>>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.hourly_rate <= 0) e.hourly_rate = 'Rate must be positive'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const res = await addCourt(form)
    setSubmitting(false)
    if (res.success && res.court) {
      toast.success(`Court "${res.court.name}" created!`)
      onAdded(res.court)
      onClose()
    } else {
      toast.error(res.error ?? 'Failed to create court')
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-court-card border border-court-border rounded-2xl p-6 shadow-glass"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-white">Add New Court</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
              Court Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Championship Court 5"
              className="input-field"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-neon-pink flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.name}
              </p>
            )}
          </div>

          {/* Surface type */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
              Surface Type
            </label>
            <div className="relative">
              <select
                value={form.surface_type}
                onChange={(e) => setForm({ ...form, surface_type: e.target.value as SurfaceType })}
                className="input-field appearance-none pr-8 capitalize"
              >
                {SURFACE_TYPES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Indoor / Outdoor + Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
                Environment
              </label>
              <div className="flex rounded-xl overflow-hidden border border-court-border">
                {['Outdoor', 'Indoor'].map((label, i) => {
                  const val = i === 1
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setForm({ ...form, is_indoor: val })}
                      className={cn(
                        'flex-1 py-2 text-sm font-medium transition-colors',
                        form.is_indoor === val
                          ? 'bg-neon-green text-court-dark'
                          : 'bg-court-card text-slate-400 hover:text-slate-200',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
                Rate / hr (₱)
              </label>
              <input
                type="number"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min={0}
                step={0.5}
              />
              {errors.hourly_rate && (
                <p className="mt-1 text-xs text-neon-pink">{errors.hourly_rate}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
              Description (optional)
            </label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Court features, notes..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
              Court Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color_hex: color })}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform',
                    form.color_hex === color
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    className="w-4 h-4 rounded-full border-2 border-court-dark/40 border-t-court-dark inline-block"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Creating...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Create Court
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── CourtRow ──────────────────────────────────────────────────────────────────

interface CourtRowProps {
  court: Court
  bookingsThisWeek: number
  revenueThisWeek: number
  onUpdate: (id: string, updates: Partial<Court>) => void
}

function CourtRow({ court, bookingsThisWeek, revenueThisWeek, onUpdate }: CourtRowProps) {
  const [active, setActive] = useState(court.is_active)
  const [toggling, setToggling] = useState(false)

  const handleToggle = async (val: boolean) => {
    setToggling(true)
    setActive(val)
    const res = await toggleCourtActive(court.id, val)
    setToggling(false)
    if (res.success) {
      toast.success(val ? 'Court activated' : 'Court deactivated')
      onUpdate(court.id, { is_active: val })
    } else {
      setActive(!val) // revert
      toast.error(res.error ?? 'Failed to toggle court')
    }
  }

  return (
    <motion.div
      layout
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-court-surface/50 border border-court-border hover:border-white/10 transition-colors"
    >
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: court.color_hex, boxShadow: `0 0 8px ${court.color_hex}60` }}
      />

      {/* Name + surface */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{court.name}</p>
        <p className="text-xs text-slate-500 capitalize">
          {court.surface_type} · {court.is_indoor ? 'Indoor' : 'Outdoor'}
        </p>
      </div>

      {/* Rate */}
      <div className="w-32">
        <RateEditor
          courtId={court.id}
          initialRate={court.hourly_rate}
          onSaved={(newRate) => onUpdate(court.id, { hourly_rate: newRate })}
        />
      </div>

      {/* Bookings this week */}
      <div className="w-20 text-center">
        <p className="text-sm font-mono font-semibold text-white">{bookingsThisWeek}</p>
        <p className="text-xs text-slate-500">bkgs</p>
      </div>

      {/* Revenue this week */}
      <div className="w-24 text-right">
        <p className="text-sm font-mono font-semibold text-neon-cyan">
          ₱{revenueThisWeek.toFixed(0)}
        </p>
        <p className="text-xs text-slate-500">this wk</p>
      </div>

      {/* Toggle */}
      <ToggleSwitch checked={active} onChange={handleToggle} disabled={toggling} />
    </motion.div>
  )
}

// ── CourtEditor (main export) ─────────────────────────────────────────────────

interface CourtEditorProps {
  initialCourts: Court[]
  bookingsByCourt: Record<string, { count: number; revenue: number }>
}

export default function CourtEditor({ initialCourts, bookingsByCourt }: CourtEditorProps) {
  const [courts, setCourts] = useState<Court[]>(initialCourts)
  const [showModal, setShowModal] = useState(false)

  const handleUpdate = (id: string, updates: Partial<Court>) => {
    setCourts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleAdded = (court: Court) => {
    setCourts((prev) => [...prev, court])
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-4 text-xs text-slate-500 uppercase tracking-widest pl-7">
          <span className="flex-1">Court</span>
          <span className="w-32">Rate</span>
          <span className="w-20 text-center">Bookings</span>
          <span className="w-24 text-right">Revenue</span>
          <span className="w-11 text-center">Active</span>
        </div>
      </div>

      {/* Court rows */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {courts.map((court) => (
            <CourtRow
              key={court.id}
              court={court}
              bookingsThisWeek={bookingsByCourt[court.id]?.count ?? 0}
              revenueThisWeek={bookingsByCourt[court.id]?.revenue ?? 0}
              onUpdate={handleUpdate}
            />
          ))}
        </AnimatePresence>
      </div>

      {courts.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">No courts yet.</p>
      )}

      {/* Add court button */}
      <motion.button
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl border border-dashed border-court-border text-slate-400
                   hover:border-neon-green/40 hover:text-neon-green transition-colors
                   flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add New Court
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <AddCourtModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
        )}
      </AnimatePresence>
    </div>
  )
}
