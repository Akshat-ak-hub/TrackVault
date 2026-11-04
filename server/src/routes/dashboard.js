import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireOrganizationMembership } from '../middleware/organization.js'
import Document from '../models/Document.js'

const router = Router()

router.get(
  '/stats',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    const filter = { organization: request.organization._id }
    if (request.membership.role === 'employee') {
      filter.owner = request.user._id
    }

    const [documentCount, pendingCount, approvedCount, rejectedCount] =
      await Promise.all([
        Document.countDocuments(filter),
        Document.countDocuments({ ...filter, status: 'pending' }),
        Document.countDocuments({ ...filter, status: 'approved' }),
        Document.countDocuments({ ...filter, status: 'rejected' }),
      ])

    return response.json({
      stats: {
        documentCount,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
    })
  },
)

export default router
