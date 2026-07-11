import crypto from 'crypto'
import path from 'path'

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg'])

export const buildStorageFileName = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase()
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ''
  return `${crypto.randomUUID()}${safeExt}`
}
