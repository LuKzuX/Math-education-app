import { supabase } from '../db/connection'
import { AuthRequest } from '../types/AuthRequest'
import { challenge_randomizer } from '../utils/challenge_randomizer'
import { checkAndGrantAchievements } from '../utils/checkAndGrantAchievements'
import { RequestHandler } from 'express'
const Parser = require('expr-eval').Parser

export const getLeaderboard: RequestHandler = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("id, username, avatar_url, total_xp, user_level")
            .order('total_xp', { ascending: false })

        if (error) return res.status(500).json({ error: error.message })
        res.json(data)
    } catch (error) {
        next(error)
    }
}