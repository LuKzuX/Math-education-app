import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabase } from '../db/connection';

export const getUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
    const { data, error } = await supabase
    .from('posts')
    .select('*');
        res.send(error)
    } catch (error) {
        res.send(error)
    }
}