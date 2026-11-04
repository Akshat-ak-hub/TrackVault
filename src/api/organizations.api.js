import { apiRequest } from './http.js'

export const organizationsApi = {
  list: () => apiRequest('/organizations'),
  create: (name) =>
    apiRequest('/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  members: (organizationId) =>
    apiRequest(`/organizations/${organizationId}/members`),
  updateMemberRole: (organizationId, memberId, role) =>
    apiRequest(`/organizations/${organizationId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  updateMemberStatus: (organizationId, memberId, isActive) =>
    apiRequest(`/organizations/${organizationId}/members/${memberId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  invite: (organizationId, details) =>
    apiRequest(`/organizations/${organizationId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  acceptInvitation: (token) =>
    apiRequest('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  invitationDetails: (token) =>
    apiRequest(`/invitations/lookup/${encodeURIComponent(token)}`),
}
