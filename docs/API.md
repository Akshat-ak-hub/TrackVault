# API contract

Base path: `/api`. JSON errors use `{ "message": "...", "errors": [] }` where field details apply. Protected endpoints require `Authorization: Bearer <token>`.

## Health

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | API and database readiness |

The current health response is `200 { "status": "ok", "services": { "api": "ok", "database": "connected" } }` when MongoDB is connected, and HTTP `503` with `status: "degraded"` when the API is running without database access.

## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Implemented: public, rate limited | Create employee account; `invitationToken` optionally joins its workspace |
| POST | `/auth/login` | Implemented: public, rate limited | Return JWT and user |
| GET | `/auth/me` | Implemented: authenticated | Return user and active workspace memberships |

## Organizations and invitations

Organization-scoped requests send `X-Organization-Id` with the selected organization ID. The server verifies active membership for that organization; roles (`admin`, `approver`, `employee`) belong to memberships, so one account can have different roles in different companies.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/organizations` | Authenticated | Create a workspace; creator becomes its admin |
| GET | `/organizations` | Authenticated | List the caller's memberships |
| GET | `/organizations/:id/members` | Workspace member | List workspace members and leaders |
| POST | `/organizations/:id/invitations` | Workspace admin/approver | Create a seven-day email invite and a prefilled WhatsApp link using an E.164 phone number |
| PATCH | `/organizations/:id/members/:membershipId/role` | Workspace admin | Change a member's workspace role |
| PATCH | `/organizations/:id/members/:membershipId/status` | Workspace admin | Deactivate or reactivate workspace access |
| GET | `/invitations/lookup/:token` | Public | Inspect invite organization, role, and email |
| POST | `/invitations/accept` | Authenticated | Join workspace; account email must match |

Registration can accept an invitation with `invitationToken`. Existing accounts sign in first, then accept the link. The phone number is used to build the `wa.me` link and is not stored in the invitation. The inviter must press Send in WhatsApp; automated delivery is not configured.

## Documents

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/documents` | Implemented: workspace member | List documents; employees see their own |
| POST | `/documents` | Implemented: workspace member | Upload metadata and first file version (multipart, 10 MB max) |
| GET | `/documents/:id` | Implemented: authorized workspace member | Read document metadata and version history |
| GET | `/documents/:id/file/:version` | Implemented: authorized workspace member | Stream private GridFS file content |
| POST | `/documents/:id/versions` | Implemented: owner/admin | Upload a new version (multipart) |
| POST | `/documents/:id/submit` | Implemented: owner/admin | Submit current version for review |
| GET | `/documents/approvals/pending` | Implemented: approver/admin | List pending workspace documents |
| POST | `/documents/:id/decision` | Implemented: approver/admin | Approve or reject; a rejection comment is required |

## Approvals, users, activity, dashboard

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/approvals?status=pending` | Planned | Dedicated approval queue route (current route is `/documents/approvals/pending`) |
| POST | `/approvals/:id/approve` | Planned | Dedicated approval decision route (current route is `/documents/:id/decision`) |
| POST | `/approvals/:id/reject` | Planned | Dedicated approval decision route (current route is `/documents/:id/decision`) |
| GET | `/activity?limit=50` | Authenticated, scoped | Recent audit events (maximum 100; employees see their own events) |
| GET | `/dashboard/stats` | Authenticated, scoped | Workspace document counts; employees receive counts for their own documents |

Document files, decisions, and audit events are persisted in MongoDB/GridFS and shared across browser sessions. Activity, dashboard statistics, and workspace admin user management are implemented. Role and status changes are recorded in the audit trail; the last active admin cannot be removed, and admins cannot deactivate their own membership.
