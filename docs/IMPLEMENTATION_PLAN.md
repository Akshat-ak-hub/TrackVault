# Implementation plan

Status terms: **Done** means present in this repository; **In progress** means current implementation slice; **Planned** means not yet implemented.

| Step | Scope | Status |
| --- | --- | --- |
| 0 | Product, architecture, API, setup, and roadmap documentation | Done |
| 1 | Express server foundation, configuration, MongoDB connection, health endpoint | Done |
| 2 | Frontend page/component structure and MVP UI with local demo workflows | Done |
| 3 | User model, registration/login API, password hashing, JWT middleware, development accounts | Done |
| 4 | Workspace memberships, company-scoped roles, invitations, and team directory | Done |
| 5 | Document metadata and private file upload/download API | Done: MongoDB and GridFS |
| 6 | Version history and approval lifecycle API | In progress: core workflow and audit events persisted |
| 7 | Connect dashboard, documents, approvals, team, and activity UI to API | In progress: documents, approvals, activity, dashboard statistics, and admin team controls connected |
| 8 | API documentation, deployment setup, integration and security verification | In progress: Docker deployment and production environment checks documented; integration/security verification remains |
| 9 | Phase 2: email delivery, departments, notifications, multi-stage approvals, trash, reset, comments, reminders | Later |

## Delivery sequence

Each step should leave the app runnable and update this plan and setup docs. The server foundation establishes configuration and a health endpoint first. Authentication follows before protected business routes. Document uploads are added only after auth and access rules exist. Approval decisions must target a specific document version and write audit entries.

## Verification gates

- Server starts with valid environment settings and fails clearly on invalid required settings.
- Health endpoint distinguishes API availability from database readiness.
- Auth paths cover invalid credentials, expiry, and inactive accounts.
- Authorization paths cover role, ownership, department scope, and self-approval.
- File handling enforces size/type limits and cleans up orphaned storage objects.
- Production build and documented deployment configuration remain current.
