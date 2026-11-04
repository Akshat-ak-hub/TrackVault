import mongoose from 'mongoose'

const versionSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: { type: String, default: '' },
  },
  { timestamps: true },
)

const documentSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    category: { type: String, trim: true, maxlength: 80, default: 'Other' },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    department: { type: String, trim: true, maxlength: 100, default: '' },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
      default: 'draft',
      index: true,
    },
    currentVersion: { type: Number, default: 1 },
    versions: { type: [versionSchema], default: [] },
    reviewComment: { type: String, default: '' },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

documentSchema.index({ organization: 1, status: 1, updatedAt: -1 })

export default mongoose.model('Document', documentSchema)
