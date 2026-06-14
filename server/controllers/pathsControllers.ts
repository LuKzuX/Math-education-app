import { supabase } from '../db/connection'
import { RequestHandler } from 'express'

export const createPath: RequestHandler = async (req, res, next) => {
  const file = req.file
  const fileName = file?.originalname
  if (!file || !fileName) return res.status(400).json({ error: 'icon is required' })

  const { title, description, order } = req.body

  await supabase.storage.from('path_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
  const { data: { publicUrl } } = supabase.storage.from('path_icons').getPublicUrl(fileName)

  const name_url = title.toLowerCase().replace(/\s+/g, '_')
  const { data, error } = await supabase
    .from('paths')
    .insert({ name_url, title, description, path_icon: publicUrl, order })
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const getPaths: RequestHandler = async (req, res, next) => {
  const { data, error } = await supabase.from('paths').select('*')
  res.send(data)
}
