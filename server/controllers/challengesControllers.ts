import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'
import { challenge_randomizer } from '../utils/challenge_randomizer'
import { checkAndGrantAchievements } from '../utils/checkAndGrantAchievements'
import { RequestHandler } from 'express'
import { calculateUserLevel } from "../utils/calculateUserLevel";
import { applyLifeRegeneration } from "../utils/regenerateLives";

export const getChallenges: RequestHandler = async (req, res, next) => {
  try {
    const { topic_id } = req.params
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('topic_id', topic_id)
    if (error) {
      console.error('getChallenges error:', error)
      return res.status(500).json({ error: 'Failed to fetch challenges' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const getChallenge: RequestHandler = async (
  req: AuthRequest,
  res,
  next,
) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const { id } = req.user
    const { challenge_id } = req.params

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('lives, last_life_lost_at')
      .eq('id', id)
      .single()

    if (userError || !user) return res.status(403).json({ error: 'No lives remaining' })

    const { lives } = await applyLifeRegeneration({ id, ...user })

    if (lives <= 0)
      return res.status(403).json({ error: 'No lives remaining' })

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('challenge_id', challenge_id)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Challenge not found' })

    const { variables, alternatives, evaluated_answer, question_text } = challenge_randomizer(
      data.variables_range, // e.g. [10, 10] → two vars, each 1–10
      data.alternatives_options, // e.g. ["{0}+{1}", "{0}-{1}", "{0}*{1}", "{0}/{1}", "{1}-{0}"]
      data.correct_answer,
      data.challenge_text
    )

    await supabase.from('current_challenges').upsert(
      {
        user_id: id,
        challenge_id,
        question_text,
        variables,
        alternatives,
        correct_answer: evaluated_answer,
        title: data.title,
        difficulty: data.difficulty,
        gold_time_sec: data.gold_time_sec,
        silver_time_sec: data.silver_time_sec,
        xp_gold: data.xp_gold,
        xp_silver: data.xp_silver,
        xp_bronze: data.xp_bronze,
        hint_text: data.hint_text,
        started_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

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
  } catch (error) {
    next(error)
  }
}

export const submitAnswer: RequestHandler = async (
  req: AuthRequest,
  res,
  next,
) => {
  const { challenge_id } = req.params
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.user
  let { user_answer, hint_used } = req.body

  if (typeof user_answer !== 'string' || !['a', 'b', 'c', 'd'].includes(user_answer)) {
    return res.status(400).json({ error: 'Invalid answer' })
  }

  let isEqual = true
  const { data: challengeData, error } = await supabase
    .from('current_challenges')
    .select('*')
    .eq('user_id', id)
    .eq('challenge_id', challenge_id)
    .maybeSingle()
  try {
    if (error || !challengeData)
      return res.status(404).json({ error: 'Invalid attempt' })

    const attempt_time = Math.floor(
      (Date.now() - new Date(challengeData.started_at).getTime()) / 1000,
    )

    let answer = undefined
    const expected_answer = challengeData.correct_answer
    for (let i = 0; i < challengeData.alternatives.length; i++) {
      if (challengeData.alternatives[i][user_answer] !== undefined) {
        answer = challengeData.alternatives[i][user_answer]
        break
      }
    }

    isEqual = JSON.stringify(answer) === JSON.stringify(expected_answer)

    if (isEqual) {
      let streak = 0
      let medal = ''
      let xp_earned = 0
      const xp_medals = {
        bronze: challengeData.xp_bronze,
        silver: challengeData.xp_silver,
        gold: challengeData.xp_gold,
      }

      if (attempt_time <= challengeData.gold_time_sec) {
        medal = 'gold'
        xp_earned = challengeData.xp_gold
      } else if (
        attempt_time > challengeData.gold_time_sec &&
        attempt_time <= challengeData.silver_time_sec
      ) {
        medal = 'silver'
        xp_earned = challengeData.xp_silver
      } else {
        medal = 'bronze'
        xp_earned = challengeData.xp_bronze
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

      const { data: userRow, error: userRowError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (userRowError || !userRow) return res.status(404).json({ error: 'User not found' })

      const user = await applyLifeRegeneration(userRow)

      const userLevel = calculateUserLevel(user.total_xp + xp_earned)

      const { data: userData } = await supabase
        .from('users')
        .update({
          total_xp: user.total_xp + xp_earned,
          streak: (user.streak += streak),
          user_level: userLevel,
        })
        .eq('id', id)
        .select()
        .single()

      checkAndGrantAchievements(id)
      const { password: _password, ...safeUserData } = userData ?? {}
      return res.send({ ...safeUserData, correct: true, medal, xp_earned })
    } else {
      const lostLives = 1

      const { data: userRow, error: userRowError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (userRowError || !userRow) return res.status(404).json({ error: 'User not found' })

      const user = await applyLifeRegeneration(userRow)

      const lives = Math.max(0, user.lives - lostLives)
      const last_life_lost_at =
        lostLives > 0 && !user.last_life_lost_at
          ? new Date().toISOString()
          : user.last_life_lost_at

      await supabase
        .from('users')
        .update({ streak: 0, lives, last_life_lost_at })
        .eq('id', id)
        .select()
        .single()
      const { password: _password, ...safeUser } = user
      res.send({ ...safeUser, streak: 0, lives, last_life_lost_at, correct: false })
    }
  } catch (err) {
    next(err)
  } finally {
    await supabase.from('current_challenges').delete().eq('user_id', id)
  }
}

export const createChallenge: RequestHandler = async (req, res, next) => {
  try {
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

    const { data: last, error: lastError } = await supabase
      .from('challenges')
      .select('order')
      .eq('topic_id', topic_id)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastError) {
      console.error('createChallenge order lookup error:', lastError)
      return res.status(500).json({ error: 'Failed to create challenge' })
    }

    const order = (last?.order ?? 0) + 1

    const { variables, alternatives, evaluated_answer, question_text } = challenge_randomizer(
      variables_range,
      alternatives_options,
      correct_answer,
      challenge_text
    )


    const { data, error } = await supabase
      .from('challenges')
      .insert({
        topic_id,
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
        variables,
        hint_text,
        alternatives_options,
        correct_answer,
        alternatives,
      })
      .select()
      .single()

    if (error) {
      console.error('createChallenge insert error:', error)
      return res.status(409).json({ error: 'Failed to create challenge' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const updateChallenge: RequestHandler = async (req, res, next) => {
  try {
    const { challenge_id } = req.params
    const { title,
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
      hint_text, } = req.body

    const { variables, alternatives, evaluated_answer, question_text } = challenge_randomizer(
      variables_range,
      alternatives_options,
      correct_answer,
      challenge_text
    )

    const { data, error } = await supabase
      .from('challenges')
      .update({
        title,
        challenge_text,
        difficulty,
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
      .eq('challenge_id', challenge_id)
      .select()
      .single()
    if (error) {
      console.error('updateChallenge error:', error)
      return res.status(404).json({ error: 'Failed to update challenge' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}

export const deleteChallenge: RequestHandler = async (req, res, next) => {
  try {
    const { challenge_id } = req.params
    const { data, error } = await supabase
      .from('challenges')
      .delete()
      .eq('challenge_id', challenge_id)
      .select()
      .single()
    if (error) {
      console.error('deleteChallenge error:', error)
      return res.status(404).json({ error: 'Failed to delete challenge' })
    }
    res.send(data)
  } catch (error) {
    next(error)
  }
}