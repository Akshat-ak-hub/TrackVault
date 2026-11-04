import app from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'

await connectDatabase()

const server = app.listen(env.port, () => {
  console.info(`TrackVault API listening on http://localhost:${env.port}`)
})

async function shutdown(signal) {
  console.info(`${signal} received; closing server.`)
  server.close(async () => {
    const mongoose = await import('mongoose')
    await mongoose.default.disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
