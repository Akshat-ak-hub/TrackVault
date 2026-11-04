import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'
import { requireAuth } from '../middleware/auth.js'
import Invitation from '../models/Invitation.js'
import Membership from '../models/Membership.js'
import User from '../models/User.js'

const router = Router()
const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
})
const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(100),
  invitationToken: z.string().min(32).optional(),
})

async function toPublicUser(user) {
  const memberships = await Membership.find({ user: user._id, isActive: true })
    .populate('organization', 'name slug')
    .lean()

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    memberships: memberships.map((membership) => ({
      id: membership._id.toString(),
      organizationId: membership.organization._id.toString(),
      organizationName: membership.organization.name,
      organizationSlug: membership.organization.slug,
      role: membership.role,
      department: membership.department,
    })),
  }
}

function createToken(user) {
  if (!env.jwtSecret) {
    const error = new Error('JWT_SECRET is not configured')
    error.status = 503
    throw error
  }

  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  })
}

router.post('/register', async (request, response) => {
  const parsed = registrationSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({
      message: 'Validation failed',
      errors: parsed.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    })
  }

  const { name, email, password, invitationToken } = parsed.data
  let invitation = null
  if (invitationToken) {
    const tokenHash = createHash('sha256').update(invitationToken).digest('hex')
    invitation = await Invitation.findOne({
      tokenHash,
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    })
    if (!invitation) {
      return response.status(400).json({
        message:
          'This invitation is invalid, expired, or has already been used. Ask the workspace leader for a new link.',
      })
    }
    if (invitation.email !== email.toLowerCase()) {
      return response.status(400).json({
        message: `This invitation was sent to ${invitation.email}. Use that email address to create the account.`,
      })
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'employee',
    })
    if (invitation) {
      await Membership.create({
        organization: invitation.organization,
        user: user._id,
        role: invitation.role,
        department: invitation.department,
      })
      invitation.acceptedAt = new Date()
      await invitation.save()
    }
    return response.status(201).json({
      token: createToken(user),
      user: await toPublicUser(user),
    })
  } catch (error) {
    if (error.code === 11000) {
      return response
        .status(409)
        .json({ message: 'An account with that email already exists' })
    }
    throw error
  }
})

router.post('/login', async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({
      message: 'Validation failed',
      errors: parsed.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    })
  }

  const email = parsed.data.email.toLowerCase()
  const user = await User.findOne({ email }).select('+passwordHash')
  const passwordMatches = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false

  if (!user || !passwordMatches || !user.isActive) {
    return response
      .status(401)
      .json({ message: 'Email or password is incorrect' })
  }

  return response.json({
    token: createToken(user),
    user: await toPublicUser(user),
  })
})

router.get('/me', requireAuth, async (request, response) => {
  response.json({ user: await toPublicUser(request.user) })
})

export default router
