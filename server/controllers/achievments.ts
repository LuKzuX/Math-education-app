import { supabase } from '../db/connection'

export const getAchievements = async (req, res, next) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

export const getUserAchievements = async (req, res, next) => {
  const user_id = req.user.id

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', user_id)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

export const grantAchievement = async (req, res, next) => {
  const user_id = req.user.id
  const { achievement_id } = req.body

  if (!achievement_id) return res.status(400).json({ error: 'achievement_id required' })

  const { data, error } = await supabase
    .from('user_achievements')
    .insert({ user_id, achievement_id })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}