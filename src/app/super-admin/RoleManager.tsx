'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, User, ShieldAlert, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile, UserRole } from '@/types'

interface RoleManagerProps {
  profiles: Profile[]
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: string }>
}

const ROLES: { value: UserRole; label: string; color: string; bg: string; border: string }[] = [
  {
    value: 'customer',
    label: 'Customer',
    color: 'text-slate-300',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
  {
    value: 'admin',
    label: 'Admin',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
  },
  {
    value: 'super_admin',
    label: 'Super Admin',
    color: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/30',
  },
]

export default function RoleManager({ profiles: initialProfiles, updateUserRole }: RoleManagerProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || p.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUpdatingId(userId)
    startTransition(async () => {
      try {
        const res = await updateUserRole(userId, newRole)
        if (res.success) {
          setProfiles((prev) =>
            prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
          )
          toast.success('Role updated successfully')
        } else {
          toast.error(res.error || 'Failed to update role')
        }
      } catch (err) {
        toast.error('An unexpected error occurred')
      } finally {
        setUpdatingId(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-court-dark border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-green/60"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-court-dark border border-white/10">
          {['all', 'customer', 'admin', 'super_admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                roleFilter === r
                  ? 'bg-neon-green text-black font-bold shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/[0.02] border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Current Role</th>
              <th className="px-4 py-3 font-semibold text-right">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const roleConfig = ROLES.find((r) => r.value === user.role) || ROLES[0]
                const isUpdating = updatingId === user.id

                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-court-card border border-white/10 flex items-center justify-center font-bold text-xs text-slate-200 uppercase">
                          {user.full_name?.slice(0, 2) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}
                      >
                        {user.role === 'super_admin' && <ShieldAlert className="w-3 h-3" />}
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'customer' && <User className="w-3 h-3" />}
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {isUpdating ? (
                          <span className="flex items-center gap-1.5 text-xs text-neon-green">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className="bg-court-dark border border-white/15 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neon-green cursor-pointer hover:border-white/30"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
