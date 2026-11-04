import { Router } from 'express'
import { randomBytes, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { env } from '../config/env.js'
import {
  requireOrganizationMembership,
  requireOrganizationRoles,
} from '../middleware/organization.js'
import { requireAuth } from '../middleware/auth.js'
import Invitation from '../models/Invitation.js'
import Membership from '../models/Membership.js'
import Organization from '../models/Organization.js'
import User from '../models/User.js'
import { createTokenHash } from '../utils/tokens.js'
import { recordAuditEvent } from '../utils/audit.js'
import mongoose from 'mongoose'

const router = Router()
const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
})
const createInvitationSchema = z.object({
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .transform((phone) => phone.replace(/[\s()-]/g, ''))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/)),
  role: z.enum(['employee', 'approver']),
  department: z.string().trim().max(100).optional().default(''),
})

router.post('/', requireAuth, async (request, response) => {
  const parsed = createOrganizationSchema.safeParse(request.body)
  if (!parsed.success) {
    return response
      .status(400)
      .json({ message: 'A valid workspace name is required' })
  }

  const slugBase = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  const organization = await Organization.create({
    name: parsed.data.name,
    slug: `${slugBase}-${randomUUID().slice(0, 8)}`,
    createdBy: request.user._id,
  })
  const membership = await Membership.create({
    organization: organization._id,
    user: request.user._id,
    role: 'admin',
  })

  return response.status(201).json({
    membership: {
      id: membership.id,
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      role: membership.role,
      department: membership.department,
    },
  })
})

router.get('/', requireAuth, async (request, response) => {
  const memberships = await Membership.find({
    user: request.user._id,
    isActive: true,
  })
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

router.get(
  '/:organizationId/members',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    const memberships = await Membership.find({
      organization: request.organization._id,
    })
      .populate('user', 'name email')
      .sort({ role: 1, createdAt: 1 })
      .lean()

    return response.json({
      members: memberships.map((membership) => ({
        id: membership._id.toString(),
        userId: membership.user._id.toString(),
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
        department: membership.department,
        isActive: membership.isActive,
      })),
    })
  },
)

router.patch(
  '/:organizationId/members/:membershipId/role',
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRoles('admin'),
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.membershipId)) {
      return response.status(404).json({ message: 'Workspace member not found' })
    }
    const parsed = z.object({ role: z.enum(['admin', 'approver', 'employee']) }).safeParse(request.body)
    if (!parsed.success) {
      return response.status(400).json({ message: 'A valid workspace role is required' })
    }
    const membership = await Membership.findOne({
      _id: request.params.membershipId,
      organization: request.organization._id,
    }).populate('user', 'name email')
    if (!membership) return response.status(404).json({ message: 'Workspace member not found' })
    if (membership.user._id.equals(request.user._id) && parsed.data.role !== 'admin') {
      return response.status(409).json({ message: 'You cannot remove your own admin role' })
    }
    if (membership.role === 'admin' && parsed.data.role !== 'admin' && membership.isActive) {
      const adminCount = await Membership.countDocuments({
        organization: request.organization._id,
        role: 'admin',
        isActive: true,
      })
      if (adminCount <= 1) return response.status(409).json({ message: 'The workspace must keep at least one active admin' })
    }
    const previousRole = membership.role
    membership.role = parsed.data.role
    await membership.save()
    await recordAuditEvent({
      organization: request.organization._id,
      actor: request.user._id,
      action: 'changed the workspace role for',
      entityType: 'membership',
      entityId: membership._id,
      entityName: membership.user.email,
      details: `${previousRole} to ${membership.role}`,
    })
    return response.json({ member: {
      id: membership._id.toString(), userId: membership.user._id.toString(),
      name: membership.user.name, email: membership.user.email,
      role: membership.role, department: membership.department, isActive: membership.isActive,
    } })
  },
)

router.patch(
  '/:organizationId/members/:membershipId/status',
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRoles('admin'),
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.membershipId)) {
      return response.status(404).json({ message: 'Workspace member not found' })
    }
    const parsed = z.object({ isActive: z.boolean() }).safeParse(request.body)
    if (!parsed.success) {
      return response.status(400).json({ message: 'A valid member status is required' })
    }
    const membership = await Membership.findOne({
      _id: request.params.membershipId,
      organization: request.organization._id,
    }).populate('user', 'name email')
    if (!membership) return response.status(404).json({ message: 'Workspace member not found' })
    if (membership.user._id.equals(request.user._id) && !parsed.data.isActive) {
      return response.status(409).json({ message: 'You cannot deactivate your own membership' })
    }
    if (membership.role === 'admin' && membership.isActive && !parsed.data.isActive) {
      const adminCount = await Membership.countDocuments({
        organization: request.organization._id,
        role: 'admin',
        isActive: true,
      })
      if (adminCount <= 1) return response.status(409).json({ message: 'The workspace must keep at least one active admin' })
    }
    membership.isActive = parsed.data.isActive
    await membership.save()
    await recordAuditEvent({
      organization: request.organization._id,
      actor: request.user._id,
      action: parsed.data.isActive ? 'reactivated workspace access for' : 'deactivated workspace access for',
      entityType: 'membership',
      entityId: membership._id,
      entityName: membership.user.email,
    })
    return response.json({ member: {
      id: membership._id.toString(), userId: membership.user._id.toString(),
      name: membership.user.name, email: membership.user.email,
      role: membership.role, department: membership.department, isActive: membership.isActive,
    } })
  },
)

router.post(
  '/:organizationId/invitations',
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRoles('admin', 'approver'),
  async (request, response) => {
    const parsed = createInvitationSchema.safeParse(request.body)
    if (!parsed.success) {
      return response
        .status(400)
        .json({ message: 'Invitation details are invalid' })
    }

    const email = parsed.data.email.toLowerCase()
    const existingUser = await User.findOne({ email }).select('_id')
    if (existingUser) {
      const existingMembership = await Membership.findOne({
        organization: request.organization._id,
        user: existingUser._id,
        isActive: true,
      })
      if (existingMembership) {
        return response
          .status(409)
          .json({ message: 'This person already belongs to the workspace' })
      }
    }

    const token = randomBytes(32).toString('base64url')
    const invitation = await Invitation.create({
      organization: request.organization._id,
      email,
      role: parsed.data.role,
      department: parsed.data.department,
      tokenHash: createTokenHash(token),
      invitedBy: request.user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    await recordAuditEvent({
      organization: request.organization._id,
      actor: request.user._id,
      action: 'created an invitation for',
      entityType: 'invitation',
      entityId: invitation._id,
      entityName: invitation.email,
      details: invitation.role,
    })
    const clientUrl = env.clientUrl.replace(/\/$/, '')
    const inviteUrl = `${clientUrl}/#/invite/${token}`
    const roleLabel = invitation.role === 'approver' ? 'Team Leader' : 'Member'
    const message = `Hi! You are invited to join ${request.organization.name} as a ${roleLabel}. Accept your invitation here: ${inviteUrl} (This link expires in 7 days.)`
    const whatsappNumber = parsed.data.phone.slice(1)

    return response.status(201).json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
        whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      },
    })
  },
)

export default router
