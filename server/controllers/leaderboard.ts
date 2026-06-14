import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'
import { challenge_randomizer } from '../utils/challenge_randomizer'
import { checkAndGrantAchievements } from '../utils/checkAndGrantAchievements'
import { RequestHandler } from 'express'
const Parser = require('expr-eval').Parser

export const getLeaderboard: RequestHandler = async (req, res, next) => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .order('total_xp', { ascending: false })
    res.json(data)
}