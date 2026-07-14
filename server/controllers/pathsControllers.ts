import { supabase } from '../db/connection'
import { RequestHandler } from 'express'
import { buildStorageFileName } from '../utils/storageFileName'

export const createPath: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, path_icon, order } = req.body
    if (!path_icon) return res.status(400).json({ error: 'icon is required' })
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' })

    const path_url = title.toLowerCase().replace(/\s+/g, '_')
    const { data, error } = await supabase
      .from('paths')
      .insert({ path_url, title, description, path_icon, order })
      .select()
      .single()

    if (error) {
      console.error('createPath error:', error)
      return res.status(409).json({ error: 'Failed to create path' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const getPaths: RequestHandler = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('paths').select('*')
    if (error) {
      console.error('getPaths error:', error)
      return res.status(500).json({ error: 'Failed to fetch paths' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const updatePath: RequestHandler = async (req, res, next) => {
  try {
    const { path_id } = req.params
    const file = req.file

    if (file) {
      const fileName = buildStorageFileName(file.originalname)
      const { error: uploadError } = await supabase.storage.from('path_icons').upload(fileName, file.buffer, { contentType: file.mimetype })
      if (uploadError) {
        console.error('Path icon upload error:', uploadError)
        return res.status(500).json({ error: 'Failed to upload path icon' })
      }
      const { data: { publicUrl } } = supabase.storage.from('path_icons').getPublicUrl(fileName)
      req.body.path_icon = publicUrl
    }

    const { title, description, order } = req.body
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' })

    const path_url = title.toLowerCase().replace(/\s+/g, '_')
    const { data, error } = await supabase
      .from('paths')
      .update({ path_url, title, description, path_icon: req.body.path_icon, order })
      .eq('id', path_id)
      .select()
      .single()

    if (error) {
      console.error('updatePath error:', error)
      return res.status(409).json({ error: 'Failed to update path' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const deletePath: RequestHandler = async (req, res, next) => {
  try {
    const { path_id } = req.params
    const { error } = await supabase.from('paths').delete().eq('id', path_id)
    if (error) {
      console.error('deletePath error:', error)
      return res.status(409).json({ error: 'Failed to delete path' })
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}
