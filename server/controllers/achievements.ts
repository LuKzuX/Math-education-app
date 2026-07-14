import { RequestHandler } from 'express'
import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'
import { upload } from '../middlewares/multer'
import { buildStorageFileName } from '../utils/storageFileName'

export const getAchievements: RequestHandler = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')

    if (error) {
      console.error('getAchievements error:', error)
      return res.status(500).json({ error: 'Failed to fetch achievements' })
    }
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

export const getUserAchievements: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const user_id = req.user.id
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user_id)

    if (error) {
      console.error('getUserAchievements error:', error)
      return res.status(500).json({ error: 'Failed to fetch user achievements' })
    }
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}



export const createAchievement: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const { title, description, xp_earned } = req.body
    const file = req.file
    if (!file) return res.status(400).json({ error: 'icon is required' })
    const fileName = buildStorageFileName(file.originalname)

    const { error: uploadError } = await supabase.storage.from('achievements_icons')
      .upload(fileName, file.buffer, { contentType: file.mimetype })
    if (uploadError) {
      console.error('Achievement icon upload error:', uploadError)
      return res.status(500).json({ error: 'Failed to upload achievement icon' })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('achievements_icons')
      .getPublicUrl(fileName)

    const { data: ach, error: insertError } = await supabase.from('achievements')
      .insert({
        title,
        description,
        xp_earned,
        icon_url: publicUrl
      })
      .select()
      .single()

    if (insertError) {
      console.error('createAchievement insert error:', insertError)
      return res.status(409).json({ error: 'Failed to create achievement' })
    }
    res.status(201).json(ach)
  } catch (error) {
    next(error)
  }
}

