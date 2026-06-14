import { supabase } from '../db/connection'

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
    attempts,
  }

  if (!achievements) return []
  const achievementsConditions = achievements.filter((field) => field.condition)
  for (let i = 0; i < achievementsConditions.length; i++) {
    const achievement = achievementsConditions[i]

    const { field, value, operator } = achievement.condition

    const statValue = stats[field as keyof typeof stats]
    if (value?.topic_id) {
      // topic completion
      const { data: challengesByTopic } = await supabase
        .from('challenges')
        .select('*')
        .eq('topic_id', value.topic_id)
        

      if (!challengesByTopic) continue

      const challengeIds = challengesByTopic.map((c) => c.challenge_id)

      const { data: topicAttempts } = await supabase
        .from('attempts')
        .select('*')
        .in('challenge_id', challengeIds)
        .eq('user_id', user_id)

      if ((topicAttempts?.length ?? 0) >= challengesByTopic.length) {
        const { data: isAchievementEarned } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('achievement_id', achievement.achievement_id)
          .eq('user_id', user_id)

        if (!isAchievementEarned?.length) {
          await supabase.from('user_achievements').insert({
            user_id,
            achievement_id: achievement.achievement_id,
            earned_at: new Date().toISOString(),
          })
        }
      }
    } else {
      // scalar comparison
      if (
        (operator === '>=' && statValue >= value) ||
        (operator === '<=' && statValue <= value) ||
        (operator === '>' && statValue > value) ||
        (operator === '<' && statValue < value) ||
        (operator === '==' && statValue === value)
      ) {
        const { data: isAchievementEarned } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('achievement_id', achievement.achievement_id)
          .eq('user_id', user_id)

        if (!isAchievementEarned?.length) {
          await supabase.from('user_achievements').insert({
            user_id,
            achievement_id: achievement.achievement_id,
            earned_at: new Date().toISOString(),
          })
        }
      }
    }
  }
}
