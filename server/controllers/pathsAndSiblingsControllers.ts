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
    hint_text,
  } = req.body

  const variables = []
  for (let i = 0; i < variables_range.length; i++) {
    variables.push(Math.floor(Math.random() * variables_range[i]))
  }

  const resolved_text = challenge_text.replace(
    /\{(\d+)\}/g,
    (_, i) => variables[Number(i)] ?? `{${i}}`,
  )

  const alternatives = []
  const alternatives_static = [
    variables[0] + variables[1],
    variables[0] * variables[1],
    variables[0] + variables[1] + variables[0],
    variables[1] - variables[0],
  ]
  let alt = alternatives_static
  for (let i = 0; i < 4; i++) {
    let choosen = Math.floor(Math.random() * alt.length)

    if (!Number.isInteger(alt[choosen])) {
      const numerator = variables[0]
      const denominator = variables[1]
      alt[choosen] = `${numerator}/${denominator}`
    }
    alternatives.push(alt[choosen])

    alt = alt.filter((x) => x !== alt[choosen])
  }
  const letters = ['a', 'b', 'c', 'd']
  for (let i = 0; i < alternatives.length; i++) {
    alternatives[i] = { [letters[i]]: alternatives[i] }
  }

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
