import { supabase } from '../db/connection'

export const MAX_LIVES = 5
export const LIFE_REGEN_INTERVAL_MS = 30 * 60 * 1000

type LivesState = {
  lives: number
  last_life_lost_at: string | null
}

export function calculateRegeneratedLives(user: LivesState): LivesState & { changed: boolean } {
  
  return { lives, last_life_lost_at, changed: true }
}

export async function applyLifeRegeneration<T extends LivesState>(user: T): Promise<T> {
  const regenerated = calculateRegeneratedLives(user)
  if (!regenerated.changed) return user

  const { lives, last_life_lost_at } = regenerated
  await supabase
    .from('users')
    .update({ lives, last_life_lost_at })
    .eq('id', (user as unknown as { id: string }).id)

  return { ...user, lives, last_life_lost_at }
}
