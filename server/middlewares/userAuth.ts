import jwt, { JwtPayload } from 'jsonwebtoken'
import { RequestHandler } from 'express'
import dotenv from 'dotenv'
dotenv.config()

export const userAuth: RequestHandler = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authorization.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set')
    return res.status(500).json({ message: 'Internal server error' })
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as JwtPayload

    (req as any).user = {
      id: verified.id,
      email: verified.email,
      is_admin: verified.is_admin,
    }

    next()
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message })
    } else {
      res.status(401).json({ message: 'Invalid token' })
    }
  }
}
