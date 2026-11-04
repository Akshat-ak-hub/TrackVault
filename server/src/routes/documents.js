import { Router } from 'express'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import {
  requireOrganizationMembership,
  requireOrganizationRoles,
} from '../middleware/organization.js'
import { documentUpload } from '../middleware/documentUpload.js'
import Document from '../models/Document.js'
import { recordAuditEvent } from '../utils/audit.js'

const router = Router()
const editableRoles = ['admin', 'approver', 'employee']
const mimeTypes = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

function getMimeType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase()
  return mimeTypes[extension] ?? 'application/octet-stream'
}

function getBucket() {
  return new GridFSBucket(mongoose.connection.db, {
    bucketName: 'documentFiles',
  })
}

function saveFile(file, uploaderId) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket()
    const stream = bucket.openUploadStream(file.originalname, {
      contentType: getMimeType(file.originalname),
      metadata: { uploaderId: uploaderId.toString() },
    })
    stream.once('error', reject)
    stream.once('finish', () => resolve(stream.id))
    stream.end(file.buffer)
  })
}

function serialize(document) {
  const documentId = document.id ?? document._id.toString()
  const versions = document.versions.map((version) => ({
    number: version.number,
    fileName: version.fileName,
    sizeBytes: version.sizeBytes,
    by: version.uploadedBy?.name ?? 'Workspace member',
    note: version.note,
    date: version.createdAt,
  }))
  const current = document.versions.find(
    (version) => version.number === document.currentVersion,
  )
  return {
    id: documentId,
    title: document.title,
    description: document.description,
    category: document.category,
    tags: document.tags,
    department: document.department,
    status: document.status[0].toUpperCase() + document.status.slice(1),
    version: document.currentVersion,
    fileName: current?.fileName ?? '',
    type: current?.fileName.split('.').pop()?.toUpperCase() ?? 'FILE',
    size: current ? `${(current.sizeBytes / 1024 / 1024).toFixed(1)} MB` : '',
    fileUrl: current ? `/documents/${documentId}/file/${current.number}` : null,
    owner: document.owner?.name ?? 'Workspace member',
    ownerId: document.owner?._id?.toString() ?? document.owner?.toString(),
    organizationId: document.organization.toString(),
    updatedAt: document.updatedAt,
    versions,
    reviewComment: document.reviewComment,
  }
}

async function findVisibleDocument(id, request) {
  const document = await Document.findOne({
    _id: id,
    organization: request.organization._id,
  })
    .populate('owner', 'name email')
    .populate('versions.uploadedBy', 'name')
  if (!document) return null
  if (
    request.membership.role === 'employee' &&
    document.owner._id.toString() !== request.user.id
  ) {
    return null
  }
  return document
}

router.get(
  '/',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    const filter = { organization: request.organization._id }
    if (request.membership.role === 'employee') filter.owner = request.user._id
    if (request.query.status)
      filter.status = String(request.query.status).toLowerCase()
    const documents = await Document.find(filter)
      .populate('owner', 'name')
      .populate('versions.uploadedBy', 'name')
      .sort({ updatedAt: -1 })
      .lean()
    return response.json({ documents: documents.map(serialize) })
  },
)

router.post(
  '/',
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRoles(...editableRoles),
  documentUpload.single('file'),
  async (request, response) => {
    if (!request.file)
      return response
        .status(400)
        .json({ message: 'A document file is required' })
    const parsed = z
      .object({
        title: z.string().trim().min(1).max(200),
        category: z.string().trim().max(80).optional().default('Other'),
        description: z.string().trim().max(2000).optional().default(''),
        tags: z.string().optional().default('[]'),
        note: z.string().trim().max(500).optional().default(''),
      })
      .safeParse(request.body)
    if (!parsed.success)
      return response
        .status(400)
        .json({ message: 'Document details are invalid' })
    let fileId
    try {
      fileId = await saveFile(request.file, request.user._id)
      const tags = JSON.parse(parsed.data.tags)
      if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
        throw new Error('Tags must be a list')
      }
      const document = await Document.create({
        organization: request.organization._id,
        owner: request.user._id,
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        tags: tags
          .slice(0, 20)
          .map((tag) => tag.trim())
          .filter(Boolean),
        department: request.membership.department,
        versions: [
          {
            number: 1,
            fileId,
            fileName: request.file.originalname,
            mimeType: getMimeType(request.file.originalname),
            sizeBytes: request.file.size,
            uploadedBy: request.user._id,
            note: parsed.data.note,
          },
        ],
      })
      await document.populate(['owner', 'versions.uploadedBy'])
      await recordAuditEvent({
        organization: document.organization,
        actor: request.user._id,
        action: 'uploaded',
        entityType: 'document',
        entityId: document._id,
        entityName: document.title,
        details: 'version 1',
      })
      return response.status(201).json({ document: serialize(document) })
    } catch (error) {
      if (fileId)
        await getBucket()
          .delete(fileId)
          .catch(() => {})
      if (error instanceof SyntaxError) {
        return response.status(400).json({ message: 'Tags must be valid JSON' })
      }
      throw error
    }
  },
)

router.get(
  '/:id/file/:version',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id))
      return response.status(404).json({ message: 'Document file not found' })
    const document = await findVisibleDocument(request.params.id, request)
    const version = document?.versions.find(
      (item) => item.number === Number(request.params.version),
    )
    if (!version)
      return response.status(404).json({ message: 'Document file not found' })
    response.set('Content-Type', version.mimeType)
    response.set('X-Content-Type-Options', 'nosniff')
    response.set(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(version.fileName)}`,
    )
    response.set('Cache-Control', 'private, no-store')
    return getBucket().openDownloadStream(version.fileId).pipe(response)
  },
)

router.get(
  '/:id',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id))
      return response.status(404).json({ message: 'Document not found' })
    const document = await findVisibleDocument(request.params.id, request)
    if (!document)
      return response.status(404).json({ message: 'Document not found' })
    return response.json({ document: serialize(document) })
  },
)

router.post(
  '/:id/versions',
  requireAuth,
  requireOrganizationMembership,
  documentUpload.single('file'),
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id))
      return response.status(404).json({ message: 'Document not found' })
    const document = await Document.findOne({
      _id: request.params.id,
      organization: request.organization._id,
    }).populate('owner', 'name')
    if (!document)
      return response.status(404).json({ message: 'Document not found' })
    if (
      request.membership.role !== 'admin' &&
      document.owner._id.toString() !== request.user.id
    )
      return response
        .status(403)
        .json({ message: 'Only the document owner can upload a new version' })
    if (!request.file)
      return response
        .status(400)
        .json({ message: 'A document file is required' })
    const note = String(request.body.note ?? '').trim()
    if (!note || note.length > 500)
      return response
        .status(400)
        .json({ message: 'A version note is required (500 characters max)' })
    const fileId = await saveFile(request.file, request.user._id)
    document.currentVersion += 1
    document.status = 'draft'
    document.reviewComment = ''
    document.reviewedBy = null
    document.reviewedAt = null
    document.versions.push({
      number: document.currentVersion,
      fileId,
      fileName: request.file.originalname,
      mimeType: getMimeType(request.file.originalname),
      sizeBytes: request.file.size,
      uploadedBy: request.user._id,
      note,
    })
    await document.save()
    await recordAuditEvent({
      organization: document.organization,
      actor: request.user._id,
      action: 'uploaded a new version of',
      entityType: 'document',
      entityId: document._id,
      entityName: document.title,
      details: `version ${document.currentVersion}`,
    })
    await document.populate(['owner', 'versions.uploadedBy'])
    return response.status(201).json({ document: serialize(document) })
  },
)

router.post(
  '/:id/submit',
  requireAuth,
  requireOrganizationMembership,
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id))
      return response.status(404).json({ message: 'Document not found' })
    const document = await Document.findOne({
      _id: request.params.id,
      organization: request.organization._id,
    }).populate('owner', 'name')
    if (!document)
      return response.status(404).json({ message: 'Document not found' })
    if (
      request.membership.role !== 'admin' &&
      document.owner._id.toString() !== request.user.id
    )
      return response
        .status(403)
        .json({ message: 'Only the document owner can submit it' })
    if (document.status === 'pending' || document.status === 'archived')
      return response.status(409).json({
        message: 'This document cannot be submitted in its current state',
      })
    document.status = 'pending'
    document.reviewComment = ''
    document.reviewedBy = null
    document.reviewedAt = null
    await document.save()
    await recordAuditEvent({
      organization: document.organization,
      actor: request.user._id,
      action: 'submitted for approval',
      entityType: 'approval',
      entityId: document._id,
      entityName: document.title,
      details: `version ${document.currentVersion}`,
    })
    return response.json({ document: serialize(document) })
  },
)

router.get(
  '/approvals/pending',
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRoles('admin', 'approver'),
  async (request, response) => {
    const documents = await Document.find({
      organization: request.organization._id,
      status: 'pending',
    })
      .populate('owner', 'name')
      .populate('versions.uploadedBy', 'name')
      .sort({ updatedAt: 1 })
      .lean()
    return response.json({ documents: documents.map(serialize) })
  },
)

router.post(
  '/:id/decision',
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRoles('admin', 'approver'),
  async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id))
      return response
        .status(404)
        .json({ message: 'Pending document not found' })
    const parsed = z
      .object({
        status: z.enum(['approved', 'rejected']),
        comment: z.string().trim().max(1000).optional().default(''),
      })
      .safeParse(request.body)
    if (!parsed.success)
      return response
        .status(400)
        .json({ message: 'A valid approval decision is required' })
    if (parsed.data.status === 'rejected' && !parsed.data.comment)
      return response
        .status(400)
        .json({ message: 'A comment is required to reject a document' })
    const document = await Document.findOne({
      _id: request.params.id,
      organization: request.organization._id,
    }).populate('owner', 'name')
    if (!document || document.status !== 'pending')
      return response
        .status(404)
        .json({ message: 'Pending document not found' })
    if (document.owner._id.toString() === request.user.id)
      return response
        .status(403)
        .json({ message: 'You cannot approve your own document' })
    document.status = parsed.data.status
    document.reviewComment = parsed.data.comment
    document.reviewedBy = request.user._id
    document.reviewedAt = new Date()
    await document.save()
    await recordAuditEvent({
      organization: document.organization,
      actor: request.user._id,
      action: parsed.data.status,
      entityType: 'approval',
      entityId: document._id,
      entityName: document.title,
      details: `version ${document.currentVersion}${parsed.data.comment ? ` · ${parsed.data.comment}` : ''}`,
    })
    return response.json({ document: serialize(document) })
  },
)

export default router
