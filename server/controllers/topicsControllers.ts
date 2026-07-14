import { supabase } from '../db/connection'
import { RequestHandler } from 'express'
import { AuthRequest } from '../types/AuthRequest'
import { buildStorageFileName } from '../utils/storageFileName'

export const createTopic: RequestHandler = async (req, res, next) => {
  try {
    const { path_id } = req.params
    const { title, description, topic_icon } = req.body
    if (!topic_icon) return res.status(400).json({ error: 'icon is required' })
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' })

    const topic_url = title.toLowerCase().replace(/\s+/g, '_')
    const { data: last, error: lastError } = await supabase
      .from('topics')
      .select('order')
      .eq('path_id', path_id)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastError) {
      console.error('createTopic order lookup error:', lastError)
      return res.status(500).json({ error: 'Failed to create topic' })
    }

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

    if (error) {
      console.error('createTopic insert error:', error)
      return res.status(409).json({ error: 'Failed to create topic' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const getTopics: RequestHandler = async (req, res, next) => {
  try {
    const { path_id } = req.params
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('path_id', path_id)
    if (error) {
      console.error('getTopics error:', error)
      return res.status(500).json({ error: 'Failed to fetch topics' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const updateTopic: RequestHandler = async (req, res, next) => {
  try {
    const { topic_id } = req.params
    const file = req.file

    if (file) {
      const fileName = buildStorageFileName(file.originalname)
      const { error: uploadError } = await supabase.storage.from('topic_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
      if (uploadError) {
        console.error('Topic icon upload error:', uploadError)
        return res.status(500).json({ error: 'Failed to upload topic icon' })
      }
      const { data: { publicUrl } } = supabase.storage.from('topic_icons').getPublicUrl(fileName)
      req.body.topic_icon = publicUrl
    }

    const { title, description } = req.body
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' })

    const topic_url = title.toLowerCase().replace(/\s+/g, '_')
    const { data, error } = await supabase
      .from('topics')
      .update({ title, topic_url, description, topic_icon: req.body.topic_icon })
      .eq('topic_id', topic_id)
      .select()
      .single()

    if (error) {
      console.error('updateTopic error:', error)
      return res.status(409).json({ error: 'Failed to update topic' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const deleteTopic: RequestHandler = async (req, res, next) => {
  try {
    const { topic_id } = req.params
    const { error } = await supabase.from('topics').delete().eq('topic_id', topic_id)
    if (error) {
      console.error('deleteTopic error:', error)
      return res.status(409).json({ error: 'Failed to delete topic' })
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

export const getTopicMedals: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const { topic_id } = req.params
    const user_id = req.user?.id
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('challenge_id')
      .eq('topic_id', topic_id)

    if (challengeError) {
      console.error('getTopicMedals challenge lookup error:', challengeError)
      return res.status(500).json({ error: 'Failed to fetch topic medals' })
    }

    const { data, error } = await supabase
      .from('attempts').select('medal_earned')
      .eq('user_id', user_id)
      .in('challenge_id', challenge?.map(c => c.challenge_id) ?? [])

    if (error) {
      console.error('getTopicMedals attempts lookup error:', error)
      return res.status(500).json({ error: 'Failed to fetch topic medals' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}