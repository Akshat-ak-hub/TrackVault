import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env.js'
import authRoutes from './routes/auth.js'
import invitationRoutes from './routes/invitations.js'
import organizationRoutes from './routes/organizations.js'
import documentRoutes from './routes/documents.js'
import activityRoutes from './routes/activity.js'
import dashboardRoutes from './routes/dashboard.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.clientUrl }))
app.use(express.json({ limit: '1mb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication requests. Try again later.' },
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/invitations', invitationRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/health', (_request, response) => {
  const databaseReady = mongoose.connection.readyState === 1
  const status = databaseReady ? 'ok' : 'degraded'

  response.status(databaseReady ? 200 : 503).json({
    status,
    services: {
      api: 'ok',
      database: databaseReady ? 'connected' : 'disconnected',
    },
  })
})

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  if (error.code?.startsWith('LIMIT_')) {
    return response
      .status(400)
      .json({ message: 'The file must be 10 MB or smaller' })
  }
  if (error.message?.startsWith('Choose a PDF')) {
    return response.status(400).json({ message: error.message })
  }
  response.status(error.status ?? 500).json({
    message: error.status ? error.message : 'Internal server error',
  })
})

export default app
