import { Router } from "express";
export const router = Router()
import { signup, signin, verifyEmail, forgotPassword, resetPassword } from "./controllers/userControllers";

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)