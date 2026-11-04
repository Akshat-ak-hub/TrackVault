import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ['approver', 'employee'],
      required: true,
    },
    department: { type: String, trim: true, default: '' },
    tokenHash: { type: String, required: true, unique: true, select: false },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.model('Invitation', invitationSchema)
