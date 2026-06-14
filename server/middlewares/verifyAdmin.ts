import { RequestHandler } from 'express'
import { AuthRequest } from '../types/AuthRequest'
export const isAdmin: RequestHandler = (req: AuthRequest, res, next) => {
    const user = req?.user
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    if (!user.is_admin) {
        return res.status(403).json({ message: 'Forbidden: Admins only' })
    }else{
        next()
    }
}
