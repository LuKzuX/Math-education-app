import { data } from 'react-router-dom'
import { supabase } from '../db/connection'
import { challenge_randomizer } from '../utils/challenge_randomizer'
import { error } from 'console'
const Parser = require('expr-eval').Parser
const NodeCache = require('node-cache')
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 })

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

  myCache.set(`challenge_${challenge_id}`, {
    challenge_id: data.challenge_id,
    text: question_text,
    variables: variables,
    alternatives: alternatives,
    correct_answer: evaluated_answer,
    title: data.title,
    difficulty: data.difficulty,
    gold_time_sec: data.gold_time_sec,
    silver_time_sec: data.silver_time_sec,
    xp_gold: data.xp_gold,
    xp_silver: data.xp_silver,
    xp_bronze: data.xp_bronze,
    hint_text: data.hint_text,
  })

  myCache.set(`attempt_${challenge_id}`, {
    started_at: Date.now(),
    sec_elapsed: 0,
  })

  res.json({
    challenge_id: data.challenge_id,
    text: question_text,
    variables: variables,
    alternatives: alternatives,
    correct_answer: evaluated_answer,
    title: data.title,
    difficulty: data.difficulty,
    gold_time_sec: data.gold_time_sec,
    silver_time_sec: data.silver_time_sec,
    xp_gold: data.xp_gold,
    xp_silver: data.xp_silver,
    xp_bronze: data.xp_bronze,
    hint_text: data.hint_text,
  })
}

export const submitAnswer = async (req, res, next) => {
  const { challenge_id } = req.params
  const { id } = req.user
  const { user_answer, hint_used } = req.body
  const challengeData = myCache.get(`challenge_${challenge_id}`)
  const attempt = myCache.get(`attempt_${challenge_id}`)
  let user_answer_value = null
  let isEqual = true
  for (let i = 0; i < challengeData.alternatives.length; i++) {
    let alternative_values = []

    alternative_values.push(challengeData.alternatives[i][user_answer])
    for (let j = 0; j < alternative_values.length; j++) {
      if (alternative_values[j] !== undefined) {
        user_answer_value = alternative_values[j]
      }
    }
  }
  for (let i = 0; i < user_answer_value.length; i++) {
    for (let j = 0; j < challengeData.correct_answer.length; j++) {
      if (user_answer_value[i] !== challengeData.correct_answer[j]) {
        isEqual = false
        break
      } else {
        continue
      }
    }
  }

  const cached_attempt = myCache.get(`attempt_${challenge_id}`)
  const cached_challenge = myCache.get(`challenge_${challenge_id}`)

  if (!challengeData || !attempt) {
    return res
      .status(404)
      .json({ error: 'Challenge session not found or expired' })
  }

  if (isEqual) {
    let medal = ''
    let xp_earned = 0
    if (cached_attempt.sec_elapsed <= cached_challenge.gold_time_sec) {
      medal = 'gold'
      xp_earned = cached_challenge.xp_gold
    } else if (
      cached_attempt.sec_elapsed > cached_challenge.gold_time_sec &&
      cached_attempt.sec_elapsed <= cached_challenge.silver_time_sec
    ) {
      medal = 'silver'
      xp_earned = cached_challenge.xp_silver
    } else {
      medal = 'bronze'
      xp_earned = cached_challenge.xp_bronze
    }
    const { data, error } = await supabase
      .from('attempts')
      .insert({
        challenge_id: challenge_id,
        user_id: id,
        submitted_at: new Date().toISOString(),
        elapsed_sec: Math.floor(
          (Date.now() - cached_attempt.started_at) / 1000,
        ),
        xp_earned,
        medal_earned: medal,
      })
      .select()
      .single()

    return res.json(data)
  } else {
    return res.json('wrong answer')
  }
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
