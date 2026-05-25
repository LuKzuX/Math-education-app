import { Router } from "express";
export const router = Router()
import userAuth from "./middlewares/userAuth";
import { signup, signin, verifyEmail, forgotPassword, resetPassword, getUser } from "./controllers/userControllers";
import {createPath, createTopic, getChallenge, createChallenge} from './controllers/pathsAndSiblingsControllers'

router.get('/user', userAuth, getUser)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.post('/new-path', createPath)
router.post('/new-topic/:path_id', createTopic)
router.post('/new-challenge/:topic_id', createChallenge)
router.get('/challenge/:challenge_id', getChallenge)
