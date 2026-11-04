import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireOrganizationMembership } from '../middleware/organization.js'
import AuditEvent from '../models/AuditEvent.js'

const router = Router()

router.get(
  '/',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    const limit = Math.min(Math.max(Number(request.query.limit) || 50, 1), 100)
    const filter = { organization: request.organization._id }
    if (request.membership.role === 'employee') filter.actor = request.user._id
    const events = await AuditEvent.find(filter)
      .populate('actor', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    return response.json({
      events: events.map((event) => ({
        id: event._id.toString(),
        organizationId: event.organization.toString(),
        type: ['invitation', 'membership'].includes(event.entityType) ? 'Users' : event.entityType === 'approval' ? 'Approvals' : 'Uploads',
        actor: event.actor?.name ?? 'Workspace member',
        actorId: event.actor?._id?.toString(),
        initials: (event.actor?.name ?? 'W').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        action: event.action,
        entity: `${event.entityName}${event.details ? ` · ${event.details}` : ''}`,
        entityId: event.entityId.toString(),
        createdAt: event.createdAt,
        time: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(event.createdAt),
        color: event.entityType === 'approval' ? 'bg-[#d6b5ff]' : event.entityType === 'invitation' ? 'bg-[#ff6b5c]' : 'bg-[#ffbd59]',
      })),
    })
  },
)

export default router
