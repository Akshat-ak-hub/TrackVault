import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

const port = Number.parseInt(process.env.PORT ?? '5000', 10)
const nodeEnv = process.env.NODE_ENV ?? 'development'
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? ''
const jwtSecret = process.env.JWT_SECRET ?? ''

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number between 1 and 65535')
}

if (nodeEnv === 'production') {
  if (
    jwtSecret.length < 32 ||
    /^(generate|replace|your)-/i.test(jwtSecret)
  ) {
    throw new Error('Production requires a JWT_SECRET with at least 32 characters')
  }
  if (!mongoUri) {
    throw new Error('Production requires MONGO_URI (or MONGODB_URI)')
  }
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Production MONGO_URI must use mongodb:// or mongodb+srv://')
  }
  let parsedClientUrl
  try {
    parsedClientUrl = new URL(clientUrl)
  } catch {
    throw new Error('CLIENT_URL must be a valid absolute URL in production')
  }
  if (parsedClientUrl.protocol !== 'https:' || parsedClientUrl.origin !== clientUrl) {
    throw new Error('Production CLIENT_URL must be an HTTPS origin without a path')
  }
}

export const env = {
  nodeEnv,
  port,
  clientUrl,
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
}
