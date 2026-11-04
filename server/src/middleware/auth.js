import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'

export async function requireAuth(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token || !env.jwtSecret) {
    return response.status(401).json({ message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.sub)
    if (!user || !user.isActive) {
      return response.status(401).json({ message: 'Account is unavailable' })
    }

    request.user = user
    return next()
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireRoles(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response
        .status(403)
        .json({ message: 'You do not have permission' })
    }
    return next()
  }
}
