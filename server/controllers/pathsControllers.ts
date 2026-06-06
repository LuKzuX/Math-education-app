import { supabase } from '../db/connection'
import { RequestHandler } from 'express'

export const createPath: RequestHandler = async (req, res, next) => {
  const { name_url, title, description, icon, order } = req.body
  const { data, error } = await supabase
    .from('paths')
    .insert({
      name_url,
      title,
      description,
      icon,
      order,
    })
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const getPaths: RequestHandler = async (req, res, next) => {
  const { data, error } = await supabase.from('paths').select('*')
  res.send(data)
}
