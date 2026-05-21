import { Router } from "express";
export const router = Router()
import { getUser, signup, signin } from "./controllers/userControllers";

router.get('/', getUser)
router.post('/signup', signup)
router.post('/signin', signin)