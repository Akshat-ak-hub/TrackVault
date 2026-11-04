import { Router } from 'express'
import { createTokenHash } from '../utils/tokens.js'
import { requireAuth } from '../middleware/auth.js'
import Invitation from '../models/Invitation.js'
import Membership from '../models/Membership.js'
import User from '../models/User.js'

const router = Router()

router.get('/lookup/:token', async (request, response) => {
  const invitation = await Invitation.findOne({
    tokenHash: createTokenHash(request.params.token),
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  }).populate('organization', 'name')

  if (!invitation) {
    return response
      .status(404)
      .json({ message: 'Invitation is invalid or expired' })
  }

  return response.json({
    invitation: {
      organizationId: invitation.organization._id.toString(),
      email: invitation.email,
      role: invitation.role,
      department: invitation.department,
      organizationName: invitation.organization.name,
      expiresAt: invitation.expiresAt,
    },
  })
})

router.post('/accept', requireAuth, async (request, response) => {
  const token = request.body?.token
  if (typeof token !== 'string' || token.length < 32) {
    return response
      .status(400)
      .json({ message: 'A valid invitation token is required' })
  }

  const invitation = await Invitation.findOne({
    tokenHash: createTokenHash(token),
    email: request.user.email,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  })
  if (!invitation) {
    return response.status(404).json({
      message:
        'Invitation is invalid, expired, already used, or for another email',
    })
  }

  const existingMembership = await Membership.findOne({
    organization: invitation.organization,
    user: request.user._id,
  })
  if (!existingMembership) {
    await Membership.create({
      organization: invitation.organization,
      user: request.user._id,
      role: invitation.role,
      department: invitation.department,
    })
  }

  invitation.acceptedAt = new Date()
  await invitation.save()
  const user = await User.findById(request.user._id)
  const memberships = await Membership.find({ user: user._id, isActive: true })
    .populate('organization', 'name slug')
    .lean()

  return response.json({
    memberships: memberships.map((membership) => ({
      id: membership._id.toString(),
      organizationId: membership.organization._id.toString(),
      organizationName: membership.organization.name,
      organizationSlug: membership.organization.slug,
      role: membership.role,
      department: membership.department,
    })),
  })
})

export default router
