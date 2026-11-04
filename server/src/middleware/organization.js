import Membership from '../models/Membership.js'
import mongoose from 'mongoose'

export async function requireOrganizationMembership(request, response, next) {
  const organizationId =
    request.params.organizationId ?? request.get('X-Organization-Id')
  if (!organizationId) {
    return response
      .status(400)
      .json({ message: 'X-Organization-Id header is required' })
  }
  if (!mongoose.isValidObjectId(organizationId)) {
    return response.status(400).json({ message: 'Workspace id is invalid' })
  }
  const requestedOrganizationId = request.get('X-Organization-Id')
  if (
    requestedOrganizationId &&
    requestedOrganizationId !== organizationId.toString()
  ) {
    return response.status(400).json({
      message: 'Workspace header does not match the requested workspace',
    })
  }

  const membership = await Membership.findOne({
    organization: organizationId,
    user: request.user.id,
    isActive: true,
  }).populate('organization', 'name slug')

  if (!membership) {
    return response
      .status(403)
      .json({ message: 'You are not a member of this workspace' })
  }

  request.membership = membership
  request.organization = membership.organization
  return next()
}

export function requireOrganizationRoles(...roles) {
  return (request, response, next) => {
    if (!request.membership || !roles.includes(request.membership.role)) {
      return response
        .status(403)
        .json({ message: 'You do not have permission' })
    }
    return next()
  }
}
