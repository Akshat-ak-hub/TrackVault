# Architecture

## System shape

TrackVault is a modular monolith: a React/Vite client talks to a Node/Express REST API. The API uses MongoDB/Mongoose for users, workspaces, memberships, document metadata, versions, and approval decisions. MongoDB GridFS stores private file binaries.

```text
React + Vite client
        | HTTPS / JSON / Bearer JWT; multipart for uploads
        v
Express API: routes -> middleware -> controllers -> services -> models
        |                                      |
        v                                      v
MongoDB                              MongoDB GridFS
metadata and memberships             private document binaries
```

## Boundaries

- **Routes** map URL/method pairs and attach middleware.
- **Middleware** handles authentication, authorization, validation, upload limits, and errors.
- **Controllers** translate HTTP requests and responses; business rules stay out of controllers.
- **Services** own workflow rules, access checks, version numbering, storage orchestration, and audit writes.
- **Models** define persistence schemas and indexes.
- **Client API/features** own HTTP calls and UI state; the browser never receives storage service credentials.

## Core records

- `User`: name, normalized unique email, password hash, active state.
- `Organization`: company workspace name, unique slug, creator.
- `Membership`: organization, user, workspace-scoped role, department, active state.
- `Invitation`: organization, invited email, role, hashed single-use token, expiry, acceptance time.
- `Document`: title, description/category/tags, status, owner, department, current version.
- `DocumentVersion`: document, version number, private storage path, original filename, MIME type, byte size, uploader, change note.
- `Approval`: document and version, requester, optional assigned approver, status, comment, decision time.
- `AuditLog`: actor, action, entity, metadata, creation time. Application code has no update/delete operation for audit records.

## Key decisions

- Keep the backend a single deployable service for MVP scale.
- Keep file binaries outside MongoDB and use private storage with short-lived signed download URLs.
- Store versions as separate records and make approvals version-specific.
- Enforce access checks in the API service layer for every operation, regardless of UI visibility.
- A user may belong to multiple organizations and hold a different role in each. Invitations bind an email to one organization and role; the server stores only a token hash and verifies membership on acceptance.
- Workspace-scoped API requests identify the selected organization, and middleware checks that the authenticated user has an active membership before returning workspace data.
- Store secrets in environment variables; never expose storage service credentials to the client.

## Failure handling

File upload and MongoDB writes cross two systems and are not transactional. The upload service must remove a newly uploaded object if metadata creation fails. Deletion/archive workflows must preserve the audit trail. API errors use a consistent JSON shape and do not expose stack traces in production.
