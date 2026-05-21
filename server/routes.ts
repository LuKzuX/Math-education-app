import { Router } from "express";
export const router = Router()
import { getUser, signup, signin, verifyEmail, resetPassword } from "./controllers/userControllers";

router.get('/', getUser)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
router.post('/reset', resetPassword)