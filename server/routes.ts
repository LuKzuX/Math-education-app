import { Router } from "express";
export const router = Router()
import { userAuth } from "./middlewares/userAuth";
import { signup, signin, verifyEmail, forgotPassword, resetPassword, getUser, getUserAttempts, updateUser, logout } from "./controllers/userControllers";
import { getPaths, createPath } from './controllers/pathsControllers'
import { getTopics, createTopic } from './controllers/topicsControllers'
import { getChallenges, getChallenge, createChallenge, submitAnswer } from './controllers/challengesControllers'
import { getAchievements, getUserAchievements, createAchievement } from "./controllers/achievments";
import { getLeaderboard } from "./controllers/leaderboard";

// User
router.get('/user', userAuth, getUser)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
//router.post('/resend-verification', resendVerification)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/user-attempts', userAuth, getUserAttempts)
router.patch('/user/update', userAuth, updateUser)
router.post('/logout', logout)

// Paths
router.get('/paths', getPaths)
router.post('/paths', userAuth, createPath)

// Topics
router.get('/paths/:path_id/topics', getTopics)
router.post('/paths/:path_id/topics', userAuth, createTopic)

// Challenges
router.get('/topics/:topic_id/challenges', getChallenges)
router.post('/topics/:topic_id/challenges', userAuth, createChallenge)

// Challenge
router.get('/challenges/:challenge_id', userAuth, getChallenge)
router.post('/challenges/:challenge_id/submit', userAuth, submitAnswer)

//Achievements
router.get('/achievements', getAchievements)
router.get('/user/achievements', userAuth, getUserAchievements)
router.post('/achievements', userAuth, createAchievement)

// Leaderboard
router.get('/leaderboard', getLeaderboard)
