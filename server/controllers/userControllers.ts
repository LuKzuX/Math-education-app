import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabase } from '../db/connection'

export const getUser = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { data, error } = await supabase.from('posts').select('*')
    res.send(error)
  } catch (error) {
    res.send(error)
  }
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, password } = req.body

    const { data: emailFound, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)

    if ((emailFound?.length ?? 0) >= 1) {
      return res.status(409).json({ message: 'This email already exists' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password,
      })
      .select()
      .single()

    if (profileError) {
      return res.status(500).json({ message: profileError.message })
    }

    res.status(201).json({
      message: 'Signup successful. Please verify your email.',
      user: profile,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ message })
  }
}
