import mongoose from 'mongoose'
import { env } from './env.js'

let reconnectTimer
let reconnectDelayMs = 30_000

function scheduleReconnect() {
  if (reconnectTimer || mongoose.connection.readyState === 1) return
  console.warn(
    `MongoDB is still disconnected; another connection attempt will start in ${Math.round(reconnectDelayMs / 1000)}s.`,
  )
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined
    void connectDatabase()
  }, reconnectDelayMs)
  reconnectTimer.unref?.()
  reconnectDelayMs = Math.min(reconnectDelayMs * 2, 5 * 60_000)
}

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn(
      'MONGO_URI (or MONGODB_URI) is not configured; API will start without database access.',
    )
    return false
  }

  const maxAttempts = 4
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 })
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
      reconnectDelayMs = 30_000
      console.info('Connected to MongoDB.')
      return true
    } catch (error) {
      const isNetworkError =
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoServerSelectionError' ||
        error.reason?.servers?.size > 0
      if (!isNetworkError || attempt === maxAttempts) {
        console.error(
          `MongoDB connection failed${isNetworkError ? ` after ${attempt} attempts` : ''}: ${error.message}`,
        )
        if (isNetworkError) scheduleReconnect()
        return false
      }

      const delayMs = 1500 * attempt
      console.warn(
        `MongoDB network connection failed (attempt ${attempt}/${maxAttempts}); retrying in ${delayMs / 1000}s.`,
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return false
}
