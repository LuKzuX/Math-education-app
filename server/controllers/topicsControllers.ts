import { supabase } from '../db/connection'
import { RequestHandler } from 'express'

export const createTopic: RequestHandler = async (req, res, next) => {
  const file = req.file
  const fileName = file?.originalname
  if (!file || !fileName) return res.status(400).json({ error: 'icon is required' })

  const { path_id } = req.params
  const { title, description } = req.body

  await supabase.storage.from('topic_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
  const { data: { publicUrl } } = supabase.storage.from('topic_icons').getPublicUrl(fileName)

  const topic_url = title.toLowerCase().replace(/\s+/g, '_')
  const { data: last } = await supabase
    .from('topics')
    .select('order')
    .eq('path_id', path_id)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const order = (last?.order ?? 0) + 1
  const { data, error } = await supabase
    .from('topics')
    .insert({
      path_id,
      title,
      topic_url,
      description,
      order,
      topic_icon: publicUrl,

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
    .eq('path_id', path_id)
  res.send(data)
}