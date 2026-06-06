import { Router } from "express";
export const router = Router()
import { userAuth } from "./middlewares/userAuth";
import { signup, signin, verifyEmail, forgotPassword, resetPassword, getUser, getUserAttempts, updateUser } from "./controllers/userControllers";
import { getPaths, createPath } from './controllers/pathsControllers'
import { getTopics, createTopic } from './controllers/topicsControllers'
import { getChallenges, getChallenge, createChallenge, submitAnswer } from './controllers/challengesControllers'
import { getAchievements, getUserAchievements } from "./controllers/achievments";

router.get('/user', userAuth, getUser)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/user-attempts', userAuth, getUserAttempts)
router.patch('/user/update', userAuth, updateUser)


// Paths
router.get('/paths', getPaths)
router.post('/paths', createPath)

// Topics
router.get('/paths/:path_id/topics', getTopics)
router.post('/paths/:path_id/topics', createTopic)

// Challenges
router.get('/topics/:topic_id/challenges', getChallenges)
router.post('/topics/:topic_id/challenges', createChallenge)

// Challenge
router.get('/challenges/:challenge_id', getChallenge)
router.post('/challenges/:challenge_id/submit', userAuth, submitAnswer)

//Achievements
router.get('/achievements', getAchievements)
router.get('/user/achievements', userAuth, getUserAchievements)
