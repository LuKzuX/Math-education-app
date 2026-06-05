import { RequestHandler } from 'express'
import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'

export const getAchievements: RequestHandler = async (req, res, next) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

export const getUserAchievements: RequestHandler = async (req: AuthRequest, res, next) => {
  if (!req.user) return res.send("invalid user logged")
  const user_id = req.user.id
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', user_id)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}