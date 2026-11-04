import mongoose from 'mongoose'

const auditEventSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, maxlength: 80 },
    entityType: { type: String, required: true, maxlength: 40 },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityName: { type: String, required: true, maxlength: 200 },
    details: { type: String, maxlength: 1000, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

auditEventSchema.index({ organization: 1, createdAt: -1 })

export default mongoose.model('AuditEvent', auditEventSchema)
