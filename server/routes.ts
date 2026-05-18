import { Router } from "express";
export const router = Router()
import { getUser } from "./controllers/userControllers";

router.get('/', getUser)