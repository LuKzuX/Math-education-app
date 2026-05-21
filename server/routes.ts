import { Router } from "express";
export const router = Router()
import { getUser, signup } from "./controllers/userControllers";

router.get('/', getUser)
router.post('/signup', signup)