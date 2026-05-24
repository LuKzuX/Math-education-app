import { supabase } from '../db/connection'
import { challenge_randomizer } from '../utils/challenge_randomizer'

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

  if (error) return res.status(409).json(error)
  res.send(data)
}

export const createChallenge = async (req, res, next) => {
  const { topic_id } = req.params
  const {
    title,
    challenge_text,
    difficulty,
    order,
    gold_time_sec,
    silver_time_sec,
    xp_gold,
    xp_silver,
    xp_bronze,
    variables_range,
    alternatives_options,
    hint_text,
  } = req.body

  const { variables, alternatives } = challenge_randomizer(
    variables_range,
    alternatives_options,
  )
  
  const resolved_text = challenge_text.replace(
    /\{(\d+)\}/g,
    (_, i) => variables[Number(i)] ?? `{${i}}`,
  )

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      topic_id,
      title,
      challenge_text: resolved_text,
      difficulty,
      order,
      gold_time_sec,
      silver_time_sec,
      xp_gold,
      xp_silver,
      xp_bronze,
      variables_range,
      variables,
      hint_text,
      alternatives,
    })
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}
