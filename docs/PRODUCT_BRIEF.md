# TrackVault product brief

## Purpose

TrackVault gives an organization one place to store controlled documents, keep their version history, request approvals, and see who changed or decided what.

## Users

- **Employee**: creates documents, uploads versions, submits owned documents for review, and views documents they are permitted to access.
- **Approver**: performs employee actions and reviews approval requests, but cannot approve their own document.
- **Admin**: manages users and roles, sees workspace documents, and reviews the full audit trail.

## MVP scope

1. Register, log in, log out, and retrieve the current user using expiring JWTs.
2. Create company workspaces and invite members or approvers by email-specific link.
3. Enforce organization membership and workspace-scoped employee, approver, and admin permissions on the server.
4. Upload, search, filter, list, view, and download documents.
5. Preserve each uploaded version and identify the exact version being reviewed.
6. Submit, approve, or reject documents. A rejection requires a comment.
7. Record important changes in an append-only audit log.
8. Show dashboard statistics derived from stored records.
9. Let admins list users and change roles or active status.

## Lifecycle and business rules

Document states are `draft`, `pending`, `approved`, `rejected`, and `archived`. Submitting a draft creates a pending approval for its current version. An approval decision applies to that version only. A new version of an approved or rejected document returns it to draft. Only an approver or admin can decide; the document owner cannot approve their own document. Every transition writes an audit entry.

## Access principles

The server is the authority for access. Employees see their own documents and documents within their department according to the eventual policy; approvers see assigned review items and permitted documents; admins can see all data in their workspace. Users can join multiple workspaces through invitations. Departments are plain text until a later phase.

## Out of scope for MVP

Billing, collaborative editing, OCR/AI processing, mobile apps, multi-stage approvals, automatic invitation email delivery, password reset, trash/restore, comments, and expiry reminders.

## Success criteria

- Users can complete the main document and approval workflows without demo-only data.
- Protected routes enforce role, ownership, and document scope on the server.
- File content stays in private object storage; MongoDB stores metadata and version records.
- Sensitive changes are traceable through an append-only audit log.
- Local setup and deployment configuration are documented.
