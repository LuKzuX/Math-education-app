import { supabase } from '../db/connection'
import { RequestHandler } from 'express'

export const createTopic: RequestHandler = async (req, res, next) => {
  const { path_id } = req.params
  const { title, description, order } = req.body
  const { data, error } = await supabase
    .from('topics')
    .insert({
      path_id,
      title,
      description,
      order,
    })
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const getTopics: RequestHandler = async (req, res, next) => {
  const { path_id } = req.params
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('topic_id', path_id)
  res.send(data)
}