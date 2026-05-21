import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabase } from '../db/connection'
import dotenv from 'dotenv'
dotenv.config()

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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body

    // 2️⃣ Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isValid = await bcrypt.compare(password, profile.password_hash)

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '99999999d' },
    )

    res.json({
      token,
      user: {
        profile,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ message })
  }
}
