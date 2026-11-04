# TrackVault

TrackVault is an enterprise document management app for storing documents, tracking versions, routing documents for approval, and recording activity.

## Current status

- Frontend: React 19, Vite, and Tailwind CSS MVP screens with real login and role-aware navigation.
- Backend: Express, MongoDB/Mongoose, JWT authentication, company workspaces, invitations, persistent document metadata and versions, GridFS file storage, and approval decisions.
- In progress: full integration/security verification. Production container setup is documented. Dashboard statistics use workspace scoped API data, and document, approval, invitation, and admin team changes are recorded in the workspace audit log.

See the [product brief](docs/PRODUCT_BRIEF.md), [frontend structure](docs/FRONTEND_STRUCTURE.md), [manual test workflow](docs/MANUAL_TEST_WORKFLOW.md), [architecture](docs/ARCHITECTURE.md), [API contract](docs/API.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md), and [production deployment guide](docs/DEPLOYMENT.md).

## Requirements

- Node.js 20 or newer and npm.
- MongoDB for persistent backend data. A local MongoDB instance or MongoDB Atlas URI can be used.

## Run locally

1. Install frontend dependencies with `npm install`.
2. Copy `server/.env.example` to `server/.env`, set `MONGO_URI`, and replace the placeholder `JWT_SECRET` with a long random value.
3. Install server dependencies with `npm install --prefix server`.
4. Start the API with `npm run dev --prefix server` (default port 5000).
5. Start the frontend with `npm run dev` (default port 5173).
6. Create or reset the development login accounts with `npm run seed:test-users --prefix server`.

### Development test accounts

The seed command creates these accounts in the configured MongoDB database:

| Role | Email | Password |
| --- | --- | --- |
| Team Leader (Approver) | `teamlead@trackvault.local` | `TeamLead!2026` |
| Member (Employee) | `member@trackvault.local` | `Member!2026` |

These accounts are for local development only. The seed script refuses to run when `NODE_ENV=production`.

The API health endpoint is `http://localhost:5000/api/health`. It reports API availability and MongoDB connection state. Workspace memberships, documents, file versions, approval decisions, and audit activity are stored in the configured MongoDB database and shared across browsers that connect to the same API. PDF and image files can be previewed in the review page; DOCX/XLSX files can be downloaded.

## Security notes

Never commit `.env` files or production credentials. Do not deploy the development test accounts. Document binaries are stored in MongoDB GridFS and served through authenticated, workspace-scoped API routes. For deployment, configure the frontend API URL and allow the deployed frontend origin in the API CORS settings.
