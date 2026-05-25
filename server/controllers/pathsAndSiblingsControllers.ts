import { supabase } from '../db/connection'
import { challenge_randomizer } from '../utils/challenge_randomizer'
const Parser = require('expr-eval').Parser
import { attemptCache } from '../cache'

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

export const getChallenge = async (req, res, next) => {
  const parser = new Parser()
  const { challenge_id } = req.params
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', challenge_id)
    .single()
  const { variables, alternatives } = challenge_randomizer(
    data.variables_range, // e.g. [10, 10] → two vars, each 1–10
    data.alternatives_options, // e.g. ["{0}+{1}", "{0}-{1}", "{0}*{1}", "{0}/{1}", "{1}-{0}"]
  )

  let i = 0
  const question_text = data.challenge_text.replace(
    /\d+/g, // matches every number in the string
    () => String(variables[i++] ?? 0), // replaces each with the next variable in order
  )

  const resolved_answer = data.correct_answer.replace(
    /\{(\d+)\}/g,
    (_, i) => String(variables[Number(i)]) ?? `{${i}}`,
  )

  const evaluated_answer = resolved_answer
    .split(',')
    .map((part) => parser.evaluate(part.trim()))

  res.json({
    text: question_text,
    variables: variables,
    alternatives: alternatives,
    correct_answer: evaluated_answer,
  })
}

export const submitAnswer = async (req, res, next) => {
  const parser = new Parser()
  const { challenge_id } = req.params
  const { user_answer, elapsed_sec, hint_used } = req.body

  // Retrieve the same variables from cache

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', challenge_id)
    .single()

  res.json(data)
}

/*/admin */ export const createChallenge = async (req, res, next) => {
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
    correct_answer,
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
      alternatives_options,
      correct_answer,
      alternatives,
    })
    .select()
    .single()

  if (error) return res.status(409).json(error)
  res.send(data)
}
