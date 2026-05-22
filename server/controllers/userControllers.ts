import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabase } from '../db/connection'
import dotenv from 'dotenv'
dotenv.config()
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const getUser = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { data, error } = await supabase.from('users').select('*')
    res.send(data)
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
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { data: profile, error: profileError } = await supabase
      .from('pending_users')
      .insert({
        username,
        email,
        password,
        token,
        expires_at: expires,
      })

    if (profileError) {
      return res.status(500).json({ message: profileError })
    }

    const verifyLink = `mathly/verify-email?token=${token}`
    await resend.emails.send({
      from: 'App <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your account.</p>`,
    })

    res
      .status(200)
      .json({ message: 'Check your email to confirm your account.', token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ message })
  }
}

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.query

  const { data: pending } = await supabase
    .from('pending_users')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!pending)
    return res.status(400).json({ message: 'Invalid or expired token.' })

  await supabase.from('users').insert({
    username: pending.username,
    email: pending.email,
    password: pending.password,
  })
  await supabase.from('pending_users').delete().eq('token', token)

  res.json({ message: 'Email verified. You can now log in.' })
}

export const signin = async (
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
      { expiresIn: '9d' },
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

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'hello world',
      html: '<p>it works!</p>',
    })
    res.send('email sent')
  } catch (error) {
    res.send(error)
  }
}
