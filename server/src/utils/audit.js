import AuditEvent from '../models/AuditEvent.js'

export function recordAuditEvent({
  organization,
  actor,
  action,
  entityType,
  entityId,
  entityName,
  details = '',
}) {
  return AuditEvent.create({
    organization,
    actor,
    action,
    entityType,
    entityId,
    entityName,
    details,
  })
}
