# Manual test workflow

This guide covers MongoDB-backed authentication, workspace membership and invitations, persistent document uploads and approvals, and role-aware navigation. Document metadata, files, versions, and approval decisions are stored in MongoDB/GridFS and are shared across browsers. PDF and image files preview in the review page; DOCX/XLSX files can be downloaded there.

## Test accounts

| Role | Email | Password |
| --- | --- | --- |
| Team Leader (Approver) | `teamlead@trackvault.local` | `TeamLead!2026` |
| Member (Employee) | `member@trackvault.local` | `Member!2026` |

The accounts are assigned to the **TrackVault Development** workspace: the Team Leader is an approver and the Member is an employee. To create or refresh these accounts and memberships, run `npm run seed:test-users --prefix server` from the project root. This seed command is development-only and refuses to run with `NODE_ENV=production`.

## Start the app

Open two terminals in the project root.

Terminal 1:

```bash
npm run dev --prefix server
```

Wait for `Connected to MongoDB.` and `TrackVault API listening on http://localhost:5000`.

Terminal 2:

```bash
npm run dev
```

Open `http://localhost:5173/#/login` in two different browsers (or a normal and private window). Both browsers must use the same API and MongoDB deployment.

## Flow A: Member submits a document

1. In Browser A, sign in as the **Member**.
2. Confirm the workspace selector shows **TrackVault Development** and the sidebar has Dashboard, Documents, My documents, Team, Activity, and Settings. Approvals should not be available to this role.
3. Open **Team** and confirm the Team Leader appears in the workspace directory with approver role and email.
4. Open **Documents** and choose **Upload document**.
5. Enter a title and category, choose a small PDF, DOCX, XLSX, PNG, or JPG file, and upload it.
6. Confirm the document appears with **Draft** status and version 1.
7. Choose **Submit for approval** and confirm the status changes to **Pending**.

## Flow B: Team Leader reviews from another browser

1. In Browser B, sign in as the **Team Leader**.
2. Confirm **Approvals** and **Team** are available.
3. Open **Approvals** and confirm the Member's pending document appears with its file preview or download.
4. Open the review page and try to reject while the comment is blank. Confirm the page asks for a comment and does not reject it.
5. Enter a short reason and reject the document.
6. In Browser A, reload **My documents** and confirm the document is marked **Rejected**.
7. Open it, upload a new version with a note, and submit that version for approval.
8. In Browser B, reload **Approvals** and approve the new version.
9. In Browser A, reload and confirm the document is marked **Approved**.

## Flow C: Access and invitations

1. While signed in as the Member, open `http://localhost:5173/#/app/approvals` directly. The UI should show **Access denied**.
2. Open `http://localhost:5173/#/app/team`. Both test accounts can view the workspace directory, but only admins and approvers can issue invitations.
3. To test invitations, sign in as the Team Leader, open **Team**, choose **Invite member**, enter an email you can access and a phone number with country code (for example `+91 98765 43210`), then create the invitation. Choose **Open WhatsApp message** and press Send in WhatsApp. Open the invitation link and register using the invited email. Confirm the new account joins **TrackVault Development** and appears in Team. Invitations expire after seven days.
4. Sign in as the Member and confirm the invitation form is unavailable.

Workspace membership, invitation, document ownership, version upload, and approval decision permissions are checked by the API. Activity entries and settings are not yet persisted.

## What should persist

- User accounts, workspace memberships, invitations, documents, file versions, and approval decisions are stored in MongoDB/GridFS.
- Login tokens are stored in each browser's session storage and checked by `/api/auth/me`.
- Activity entries and settings remain in browser memory.

The MongoDB check endpoint is `http://localhost:5000/api/health`. It should return HTTP 200 with `"database": "connected"` while Atlas is reachable.
