import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export default function userAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers
  if (!authorization) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const token = authorization.split(' ')[1]
  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development',
    )
    req.user = verified
    next()
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message })
    } else {
      res.status(401).json({ message: 'Invalid token' })
    }
  }
}

