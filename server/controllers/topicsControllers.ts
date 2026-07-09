import { supabase } from '../db/connection'
import { RequestHandler } from 'express'
import { AuthRequest } from '../types/AuthRequest'

export const createTopic: RequestHandler = async (req, res, next) => {
  const { path_id } = req.params
  const { title, description, topic_icon } = req.body
  if (!topic_icon) return res.status(400).json({ error: 'icon is required' })

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
      topic_icon,
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

export const updateTopic: RequestHandler = async (req, res, next) => {
  const { topic_id } = req.params
  const file = req.file
  const fileName = file?.originalname

  if (file && fileName) {
    await supabase.storage.from('topic_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
    const { data: { publicUrl } } = supabase.storage.from('topic_icons').getPublicUrl(fileName)
    req.body.topic_icon = publicUrl
  }

  const { title, description } = req.body
  const topic_url = title.toLowerCase().replace(/\s+/g, '_')
  const { data, error } = await supabase
    .from('topics')
    .update({ title, topic_url, description, topic_icon: req.body.topic_icon })
    .eq('topic_id', topic_id)
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const deleteTopic: RequestHandler = async (req, res, next) => {
  const { topic_id } = req.params
  const { error } = await supabase.from('topics').delete().eq('topic_id', topic_id)
  if (error) return res.status(409).json(error)
  res.sendStatus(204)
}

export const getTopicMedals: RequestHandler = async (req: AuthRequest, res, next) => {
  const { topic_id } = req.params
  const user_id = req.user?.id
  if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('challenge_id')
    .eq('topic_id', topic_id)

  const { data, error } = await supabase
    .from('attempts').select('medal_earned')
    .eq('user_id', user_id)
    .in('challenge_id', challenge?.map(c => c.challenge_id) ?? [])
  res.send(data)
}