// types/AuthRequest.ts
import { Request } from 'express'

declare global
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    is_admin: boolean
  }
}