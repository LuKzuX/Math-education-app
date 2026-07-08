import { supabase } from '../db/connection'

export const MAX_LIVES = 5
export const LIFE_REGEN_INTERVAL_MS = 30 * 60 * 1000

type LivesState = {
  lives: number
  last_life_lost_at: string | null
}

export function calculateRegeneratedLives(user: LivesState): LivesState & { changed: boolean } {
  if (user.lives >= MAX_LIVES || !user.last_life_lost_at) {
    return { lives: user.lives, last_life_lost_at: user.last_life_lost_at, changed: false }
  }

  const elapsedMs = Date.now() - new Date(user.last_life_lost_at).getTime()
  const intervalsPassed = Math.floor(elapsedMs / LIFE_REGEN_INTERVAL_MS)

  if (intervalsPassed <= 0) {
    return { lives: user.lives, last_life_lost_at: user.last_life_lost_at, changed: false }
  }

  const lives = Math.min(MAX_LIVES, user.lives + intervalsPassed)
  const last_life_lost_at =
    lives >= MAX_LIVES
      ? null
      : new Date(
          new Date(user.last_life_lost_at).getTime() + intervalsPassed * LIFE_REGEN_INTERVAL_MS,
        ).toISOString()

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
