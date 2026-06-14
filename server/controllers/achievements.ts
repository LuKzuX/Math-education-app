import { RequestHandler } from 'express'
import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'
import { upload } from '../middlewares/multer'

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



export const createAchievement: RequestHandler = async (req: AuthRequest, res, next) => {
  if (!req.user) return res.send("invalid user logged")
  const user_id = req.user.id
  const { title, description, xp_earned } = req.body
  const file = req.file
  const fileName = file?.originalname
  if (!file || !fileName) return res.status(400).json({ error: 'icon is required' })
  const { data, error } = await supabase.storage.from('achievements_icons')
    .upload(fileName, file.buffer, { contentType: file.mimetype })
  const { data: { publicUrl } } = supabase.storage
    .from('achievements_icons')
    .getPublicUrl(fileName)

  await supabase.from('achievements').insert({
    title,
    description,
    xp_earned,
    icon_url: publicUrl
  })

}

