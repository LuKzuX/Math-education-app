import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'
import { challenge_randomizer } from '../utils/challenge_randomizer'
import { checkAndGrantAchievements } from '../utils/checkAndGrantAchievements'
import { RequestHandler } from 'express'
const Parser = require('expr-eval').Parser
const NodeCache = require('node-cache')
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 })

export const getChallenges: RequestHandler = async (req, res, next) => {
  const { topic_id } = req.params
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('topic_id', topic_id)
  res.send(data)
}

export const getChallenge: RequestHandler = async (req, res, next) => {
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

  if (data.variables_range.length > 0) {
    const resolved_answer = data.correct_answer.replace(
      /\{(\d+)\}/g,
      (_: string, i: string) => String(variables[Number(i)]) ?? `{${i}}`,
    )

    const evaluated_answer = resolved_answer
      .split(',')
      .map((part: string) => parser.evaluate(part.trim()))

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
  } else {
    const evaluated_answer = data.correct_answer
      .split(',')
      .map((part: string) => part.trim())
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
  }

  myCache.set(`attempt_${challenge_id}`, {
    started_at: Date.now(),
    sec_elapsed: 0,
  })

  res.json({
    challenge_id: data.challenge_id,
    text: question_text,
    variables: variables,
    alternatives: alternatives,
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

export const submitAnswer: RequestHandler = async (
  req: AuthRequest,
  res,
  next,
) => {
  const { challenge_id } = req.params
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.user
  const { user_answer, hint_used } = req.body
  const challengeData = myCache.get(`challenge_${challenge_id}`)
  const attempt = myCache.get(`attempt_${challenge_id}`)
  let user_answer_value = null
  let isEqual = true
  if (!challengeData) {
    return res.send('invalid attempt')
  }
  for (let i = 0; i < challengeData.alternatives.length; i++) {
    let alternative_values = []
    alternative_values.push(challengeData.alternatives[i][user_answer])
    for (let j = 0; j < alternative_values.length; j++) {
      if (alternative_values[j] !== undefined) {
        user_answer_value = alternative_values[j]
      }
    }
  }
  if (user_answer_value.length !== challengeData.correct_answer.length) {
    isEqual = false
  } else {
    for (let i = 0; i < user_answer_value.length; i++) {
      if (user_answer_value[i] !== challengeData.correct_answer[i]) {
        isEqual = false
        break
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
    let streak = 0
    let medal = ''
    let xp_earned = 0
    const xp_medals = {
      bronze: cached_challenge.xp_bronze,
      silver: cached_challenge.xp_silver,
      gold: cached_challenge.xp_gold,
    }

    const attempt_time = Math.floor(
      (Date.now() - cached_attempt.started_at) / 1000,
    )

    if (attempt_time <= cached_challenge.gold_time_sec) {
      medal = 'gold'
      xp_earned = cached_challenge.xp_gold
    } else if (
      attempt_time > cached_challenge.gold_time_sec &&
      attempt_time <= cached_challenge.silver_time_sec
    ) {
      medal = 'silver'
      xp_earned = cached_challenge.xp_silver
    } else {
      medal = 'bronze'
      xp_earned = cached_challenge.xp_bronze
    }

    const { data: attemptData } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', id)
      .eq('challenge_id', challenge_id)
      .maybeSingle()

    if (!attemptData) {
      xp_earned = xp_medals[medal as keyof typeof xp_medals]

      await supabase.from('attempts').insert({
        user_id: id,
        challenge_id: challenge_id,
        elapsed_sec: attempt_time,
        medal_earned: medal,
        xp_earned: xp_medals[medal as keyof typeof xp_medals],
      })
    } else {
      xp_earned =
        xp_medals[medal as keyof typeof xp_medals] >= attemptData.xp_earned
          ? xp_medals[medal as keyof typeof xp_medals] - attemptData.xp_earned
          : 0
      const { data, error } = await supabase
        .from('attempts')
        .update({
          elapsed_sec: attempt_time,
          medal_earned: medal,
          xp_earned: xp_medals[medal as keyof typeof xp_medals],
        })
        .eq('user_id', id)
        .eq('challenge_id', challenge_id)
        .select()

      streak = data ? (streak = 0) : (streak = 1)
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    const { data: userData } = await supabase
      .from('users')
      .update({
        total_xp: user.total_xp + xp_earned,
        streak: (user.streak += streak),
      })
      .eq('id', id)
      .select()
      .single()

    checkAndGrantAchievements(id)
    myCache.flushAll()
    return res.send(userData)
  } else {
    let lostLives = 0
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', id)
      .eq('challenge_id', challenge_id)

    lostLives = data ? (lostLives = 0) : (lostLives = 1)

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    await supabase
      .from('users')
      .update({ streak: (user.streak = 0), lives: (user.lives -= lostLives) })
      .eq('id', id)
      .select()
      .single()
    myCache.flushAll()
    res.send(user)
  }
}
/*/admin */ export const createChallenge: RequestHandler = async (
  req,
  res,
  next,
) => {
  const { topic_id } = req.params
  const {
    title,
    challenge_text,
    difficulty,
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

  const { data: last } = await supabase
    .from('challenges')
    .select('order')
    .eq('topic_id', topic_id)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const order = (last?.order ?? 0) + 1

  const { variables, alternatives } = challenge_randomizer(
    variables_range,
    alternatives_options,
  )
  const resolved_text = challenge_text.replace(
    /\{(\d+)\}/g,
    (_: string, i: string) => String(variables[Number(i)] ?? `{${i}}`),
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
