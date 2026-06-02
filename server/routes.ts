import { Router } from "express";
export const router = Router()
import userAuth from "./middlewares/userAuth";
import { signup, signin, verifyEmail, forgotPassword, resetPassword, getUser, getUserAttempts } from "./controllers/userControllers";
import {createPath, createTopic, getPaths, getTopics, getChallenges, getChallenge, submitAnswer, createChallenge} from './controllers/pathsAndSiblingsControllers'
import { getAchievements, getUserAchievements } from "./controllers/achievments";

router.get('/user', userAuth, getUser)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/user-attempts', userAuth, getUserAttempts)


router.get('/paths', getPaths)
router.get('/paths/:path_id/topics', getTopics)
router.get('/topics/:topic_id/challenges', getChallenges)
router.post('/new-path', createPath)
router.post('/new-topic/:path_id', createTopic)
router.post('/new-challenge/:topic_id', createChallenge)
router.get('/challenge/:challenge_id', getChallenge)
router.post('/challenge/:challenge_id', userAuth, submitAnswer)


router.get('/achievements', getAchievements)
router.get('/user/achievements', userAuth, getUserAchievements)
