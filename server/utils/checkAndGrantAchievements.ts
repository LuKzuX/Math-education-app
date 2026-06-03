import { supabase } from "../db/connection"

export const checkAndGrantAchievements = async (user_id: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single()

  // fetch attempt stats
  const { data: attempts, error: err } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', user_id)

  const { data: achievements } = await supabase.from('achievements').select('*')

  const golds =
    attempts?.filter((attempt) => attempt.medal_earned === 'gold').length ?? 0
  const totalCorrect = attempts?.length ?? 0
  const level = user.level
  const streak = user.streak

  const stats = {
    golds,
    totalCorrect,
    streak,
    level,
  }

  const achievementsConditions = achievements.filter((field) => field.condition)
  for (let i = 0; i < achievementsConditions.length; i++) {
    const achievement = achievementsConditions[i]

    const { field, value, operator } = achievement.condition
    if (
      (operator === '>=' && stats[field] >= value) ||
      (operator === '<=' && stats[field] <= value) ||
      (operator === '>' && stats[field] > value) ||
      (operator === '<' && stats[field] < value) ||
      (operator === '==' && stats[field] === value)
    ) {
      const { data: isAchievementEarned, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('achievement_id', achievement.achievement_id)
        .eq('user_id', user_id)

      if (!isAchievementEarned) {
        await supabase.from('user_achievements').insert({
          user_id,
          achievement_id: achievement.achievement_id,
          earned_at: new Date().toISOString(),
        })
      }
    }
  }
}