import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabase } from '../db/connection'
import dotenv from 'dotenv'
dotenv.config()
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const getUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()
    if (error) return res.status(500).json({ message: error.message })
    res.json(data)
  } catch (error) {
    res.send(error)
  }
}

export const getUserAttempts = async (req, res, next) => {
  const { id } = req.user
  const {data, error} = await supabase
  .from("attempts")
  .select("*")
  .eq('user_id', id)
  res.json(data)
}

export const getUserAchievments = async (req, res, next ) => {

}

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    const { data: emailFound, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)

    if ((emailFound?.length ?? 0) >= 1) {
      return res.status(409).json({ message: 'This email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { data: profile, error: profileError } = await supabase
      .from('pending_users')
      .insert({
        username,
        email,
        password: hashedPassword,
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

export const verifyEmail = async (req, res, next) => {
  const token = req.query.token as string

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

export const signin = async (req, res, next) => {
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
    const isValid = await bcrypt.compare(password, profile.password)

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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const token = crypto.randomBytes(32).toString('hex')
    const verifyLink = `mathly/password-reset?token=${token}`

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!user) {
      return res.status(404).json({ message: 'Email not found' })
    }

    await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
    })

    await resend.emails.send({
      from: 'App <onboarding@resend.dev>',
      to: email,
      subject: 'Password reset',
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your account.</p>`,
    })

    res
      .status(200)
      .json({ message: 'Check your email to reset your password', token })
  } catch (error) {
    res.send(error)
  }
}

export const resetPassword = async (req, res, next) => {
  const token = req.query.token as string
  const { newPassword } = req.body

  try {
    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    const { data: resetRecord, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ password: newHashedPassword })
      .eq('id', resetRecord.user_id)

    if (updateError)
      return res.status(500).json({ message: 'Failed to update password' })

    await supabase.from('password_reset_tokens').delete().eq('token', token)

    res.status(200).json({ message: 'Password updated successfully' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.json({ message })
  }
}
