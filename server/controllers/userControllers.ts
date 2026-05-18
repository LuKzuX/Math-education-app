import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const getUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        res.send("Hello")
    } catch (error) {
        res.send(error)
    }
}