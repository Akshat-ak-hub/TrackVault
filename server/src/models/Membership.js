import mongoose from 'mongoose'

const membershipSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'approver', 'employee'],
      default: 'employee',
      required: true,
    },
    department: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

membershipSchema.index({ organization: 1, user: 1 }, { unique: true })

export default mongoose.model('Membership', membershipSchema)
