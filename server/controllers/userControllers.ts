import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabase } from '../db/connection'
import dotenv from 'dotenv'
dotenv.config()
import crypto from 'crypto'
import { Resend } from 'resend'
import { RequestHandler } from 'express'
import { AuthRequest } from '../types/AuthRequest'
import { buildStorageFileName } from '../utils/storageFileName'
import { buildVerifyEmail, buildResetPasswordEmail } from '../utils/emailTemplates'
import { getClientUrl } from '../utils/clientUrl'

const resend = new Resend(process.env.RESEND_API_KEY)

export const getUser: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()
    if (error) {
      console.error('getUser error:', error)
      return res.status(500).json({ message: 'Failed to fetch user' })
    }
    if (!data) return res.status(404).json({ message: 'User not found' })
    const { password: _password, ...safeData } = data
    res.json(safeData)
  } catch (error) {
    next(error)
  }
}

export const updateUser: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const user_id = req.user?.id
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' });
    const { username, email } = req.body
    const file = req.file

    let avatar_url: string | undefined
    if (file) {
      const fileName = buildStorageFileName(file.originalname)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file.buffer, { contentType: file.mimetype })
      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        return res.status(500).json({ message: 'Failed to upload avatar' })
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatar_url = publicUrl
    }

    if (email) {
      const { data: emailFound, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', user_id)
      if (error) {
        console.error('Email lookup error:', error)
        return res.status(500).json({ message: 'Failed to update user' })
      }
      if ((emailFound?.length ?? 0) >= 1) {
        return res.status(409).json({ message: 'This email already exists' })
      }

      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      const verifyLink = `${getClientUrl()}verify-email?token=${token}`

      await supabase.from('password_reset_tokens').insert({
        user_id: user_id,
        token,
        expires_at: expires.toISOString(),
      });

      const { html, text } = buildVerifyEmail({ verifyLink, expiresInText: '1 hour' })
      const { error: sendError } = await resend.emails.send({
        from: 'Mathly <noreply@math-ly.com>',
        to: email,
        subject: 'Verify your new email address',
        html,
        text,
      })
      if (sendError) {
        console.error('Resend error:', sendError)
        return res.status(500).json({ message: 'Failed to send verification email' })
      }
    }

    const updates = Object.fromEntries(
      Object.entries({ username, email, avatar_url }).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const { error: err } = await supabase.from('users').update(updates).eq('id', user_id);
    if (err) {
      console.error('User update error:', err)
      return res.status(500).json({ message: 'Failed to update user' })
    }

    res.status(200).json({ message: 'User updated successfully', ...updates });
  } catch (error) {
    next(error)
  }
}

export const getUserAttempts: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" })
    const { id } = req.user
    const { data, error } = await supabase
      .from("attempts")
      .select("*")
      .eq('user_id', id)
    if (error) {
      console.error('getUserAttempts error:', error)
      return res.status(500).json({ message: 'Failed to fetch attempts' })
    }
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export const getUserAchievments: RequestHandler = async (req: AuthRequest, res, next) => {

  const user_id = req.user?.id
  if (!user_id) return res.status(401).json({ message: 'Unauthorized' });
  const { data, error } = await supabase
    .from("users_achievements")
    .select("achievement_id")
    .eq("user_id", user_id)

  const { data: achievements, error: err } = await supabase
    .from("achievements")
    .select("*")
    .eq("achievement_id", data)
  res.send(achievements)
}

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' })
    }

    const { data: emailFound, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ message: 'Failed to send verification email' })
    }
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
      console.error('signup insert error:', profileError)
      return res.status(500).json({ message: 'Failed to create account' })
    }

    const verifyLink = `${getClientUrl()}verify-email?token=${token}`
    const { html, text } = buildVerifyEmail({ verifyLink, username, expiresInText: '24 hours' })
    const { error: sendError } = await resend.emails.send({
      from: 'Mathly <noreply@math-ly.com>',
      to: email,
      subject: 'Confirm your Mathly account',
      html,
      text,
    })
    if (sendError) {
      console.error('Resend error:', sendError)
      return res.status(500).json({ message: 'Failed to send verification email' })
    }

    res
      .status(200)
      .json({ message: 'Check your email to confirm your account.' })
  } catch (error) {
    next(error)
  }
}

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const token = req.query.token as string
    if (!token) return res.status(400).json({ message: 'Invalid or expired token.' })

    const { data: pending, error } = await supabase
      .from('pending_users')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !pending)
      return res.status(400).json({ message: 'Invalid or expired token.' })

    const { error: insertError } = await supabase.from('users').insert({
      username: pending.username,
      email: pending.email,
      password: pending.password,
    })
    if (insertError) {
      console.error('verifyEmail insert error:', insertError)
      return res.status(500).json({ message: 'Failed to verify email' })
    }

    await supabase.from('pending_users').delete().eq('token', token)

    res.json({ message: 'Email verified. You can now log in.' })
  } catch (error) {
    next(error)
  }
}

export const signin: RequestHandler = async (req, res, next) => {
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
      { id: profile.id, email: profile.email, is_admin: profile.is_admin },
      process.env.JWT_SECRET as string,
      { expiresIn: '9d' },
    )

    const { password: _password, ...safeProfile } = profile

    res.json({
      token,
      user: safeProfile,
    })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body
    const genericResponse = {
      message: 'If an account with that email exists, a reset link has been sent.',
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (!user) {
      return res.status(200).json(genericResponse)
    }

    const token = crypto.randomBytes(32).toString('hex')
    const resetLink = `${getClientUrl()}password-reset?token=${token}`

    await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
    })

    const { html, text } = buildResetPasswordEmail({ resetLink, username: user.username, expiresInText: '1 hour' })
    const { error: sendError } = await resend.emails.send({
      from: 'Mathly <noreply@math-ly.com>',
      to: email,
      subject: 'Reset your Mathly password',
      html,
      text,
    })
    if (sendError) console.error('Resend error:', sendError)

    res.status(200).json(genericResponse)
  } catch (error) {
    next(error)
  }
}

export const resetPassword: RequestHandler = async (req, res, next) => {
  const token = req.query.token as string
  const { newPassword } = req.body

  if (!token || !newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({ message: 'Token and new password are required' })
  }

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
  } catch (error) {
    next(error)
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  res.status(200).json({ message: 'Logged out successfully' })
}
