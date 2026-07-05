import { supabase } from '../db/connection'
import { RequestHandler } from 'express'

export const createPath: RequestHandler = async (req, res, next) => {
  const file = req.file
  const fileName = file?.originalname
  if (!file || !fileName) return res.status(400).json({ error: 'icon is required' })

  const { title, description, order } = req.body

  const { error: uploadError } = await supabase.storage.from('path_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
  if (uploadError) return res.status(500).json(uploadError)
  const { data: { publicUrl } } = supabase.storage.from('path_icons').getPublicUrl(fileName)

  const path_url = title.toLowerCase().replace(/\s+/g, '_')
  const { data, error } = await supabase
    .from('paths')
    .insert({ path_url, title, description, path_icon: publicUrl, order })
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const getPaths: RequestHandler = async (req, res, next) => {
  const { data, error } = await supabase.from('paths').select('*')
  res.send(data)
}

export const updatePath: RequestHandler = async (req, res, next) => {
  const { path_id } = req.params
  const file = req.file
  const fileName = file?.originalname

  if (file && fileName) {
    const { error: uploadError } = await supabase.storage.from('path_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
    if (uploadError) return res.status(500).json(uploadError)
    const { data: { publicUrl } } = supabase.storage.from('path_icons').getPublicUrl(fileName)
    req.body.path_icon = publicUrl
  }

  const { title, description, order } = req.body
  const path_url = title.toLowerCase().replace(/\s+/g, '_')
  const { data, error } = await supabase
    .from('paths')
    .update({ path_url, title, description, path_icon: req.body.path_icon, order })
    .eq('id', path_id)
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const deletePath: RequestHandler = async (req, res, next) => {
  const { path_id } = req.params
  const { error } = await supabase.from('paths').delete().eq('id', path_id)
  if (error) return res.status(409).json(error)
  res.sendStatus(204)
}
