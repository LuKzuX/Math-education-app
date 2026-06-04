import { RequestParamHandler } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

const userAuth: RequestParamHandler = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authorization.split(' ')[1]

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development',
    ) as JwtPayload

    req.user = {
      id: verified.id,
      email: verified.email,
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
