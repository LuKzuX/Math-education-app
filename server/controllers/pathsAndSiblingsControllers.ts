import { supabase } from '../db/connection'

export const createPath = async (req, res, next) => {
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

export const createTopic = async (req, res, next) => {
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
    console.log(req.params);
    

  if (error) return res.status(409).json(error)
  res.send(data)
}
