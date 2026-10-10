'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Court } from '@/types'

// ── getCourts ─────────────────────────────────────────────────────────────────

/**
 * Returns all active courts ordered by name.
 * Safe to call from Server Components and Server Actions.
 */
export async function getCourts(): Promise<Court[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('[getCourts]', error)
    return []
  }

  return (data ?? []) as Court[]
}

// ── getCourtById ──────────────────────────────────────────────────────────────

/**
 * Returns a single court by ID, or null if not found.
 */
export async function getCourtById(id: string): Promise<Court | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = row not found — silent
      console.error('[getCourtById]', error)
    }
    return null
  }

  return data as Court
}

// ── updateCourt ───────────────────────────────────────────────────────────────

/**
 * Admin-only: updates arbitrary court fields.
 */
export async function updateCourt(
  id: string,
  data: Partial<Omit<Court, 'id' | 'created_at'>>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Authentication required' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { success: false, error: 'Admin access required' }
  }

  const { error } = await supabase.from('courts').update(data).eq('id', id)

  if (error) {
    console.error('[updateCourt]', error)
    return { success: false, error: 'Failed to update court' }
  }

  revalidatePath('/book')
  revalidatePath('/dashboard')
  revalidatePath('/admin/courts')

  return { success: true }
}

// ── toggleCourtActive ─────────────────────────────────────────────────────────

/**
 * Admin-only: toggles the is_active flag on a court.
 * A deactivated court will not appear in public listings.
 */
export async function toggleCourtActive(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Authentication required' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { success: false, error: 'Admin access required' }
  }

  // Fetch current value
  const { data: court, error: fetchError } = await supabase
    .from('courts')
    .select('is_active')
    .eq('id', id)
    .single()

  if (fetchError || !court) {
    return { success: false, error: 'Court not found' }
  }

  const { error } = await supabase
    .from('courts')
    .update({ is_active: !court.is_active })
    .eq('id', id)

  if (error) {
    console.error('[toggleCourtActive]', error)
    return { success: false, error: 'Failed to toggle court status' }
  }

  revalidatePath('/book')
  revalidatePath('/admin/courts')

  return { success: true }
}
