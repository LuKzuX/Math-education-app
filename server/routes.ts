import { Router } from "express";
import express from 'express'
export const router = Router()
import { userAuth } from "./middlewares/userAuth";
import { signup, signin, verifyEmail, forgotPassword, resetPassword, getUser, getUserAttempts, updateUser, logout } from "./controllers/userControllers";
import { getPaths, createPath, updatePath, deletePath } from './controllers/pathsControllers'
import { getTopics, createTopic, updateTopic, deleteTopic, getTopicMedals } from './controllers/topicsControllers'
import { getChallenges, getChallenge, createChallenge, submitAnswer, updateChallenge, deleteChallenge } from './controllers/challengesControllers'
import { getAchievements, getUserAchievements, createAchievement } from "./controllers/achievements";
import { getLeaderboard } from "./controllers/leaderboard";
import { upload } from "./middlewares/multer";
import { isAdmin } from "./middlewares/verifyAdmin";

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
router.post('/paths', userAuth, isAdmin, upload.none(), createPath)
router.patch('/paths/:path_id', userAuth, isAdmin, upload.single('path_icon'), updatePath)
router.delete('/paths/:path_id', userAuth, isAdmin, deletePath)

// Topics
router.get('/paths/:path_id/topics', getTopics)
router.post('/paths/:path_id/topics', userAuth, isAdmin, createTopic)
router.patch('/topics/:topic_id', userAuth, isAdmin, upload.single('topic_icon'), updateTopic)
router.delete('/topics/:topic_id', userAuth, isAdmin, deleteTopic)
router.get('/topics/:topic_id/medals', userAuth, getTopicMedals)

// Challenges
router.get('/topics/:topic_id/challenges', getChallenges)
router.post('/topics/:topic_id/challenges', userAuth, isAdmin, createChallenge)

// Challenge
router.get('/challenges/:challenge_id', userAuth, getChallenge)
router.post('/challenges/:challenge_id/submit', userAuth, submitAnswer)
router.patch('/challenges/:challenge_id', userAuth, isAdmin, updateChallenge)
router.delete('/challenges/:challenge_id', userAuth, isAdmin, deleteChallenge)

//Achievements
router.get('/achievements', getAchievements)
router.get('/user/achievements', userAuth, getUserAchievements)
router.post('/achievements', userAuth, isAdmin, upload.single('achievement_icon'), createAchievement)

// Leaderboard
router.get('/leaderboard', getLeaderboard)