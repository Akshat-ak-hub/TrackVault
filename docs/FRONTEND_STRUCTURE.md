# Frontend pages and components

## Pages

The frontend includes the MVP screen set. Feature pages are rendered through `src/pages/AppRoutes.jsx`; login and registration use the API. Document, team, and activity data load from the API. Dashboard counts are requested from a workspace scoped endpoint:

| Page | Route target | Status | Purpose |
| --- | --- | --- | --- |
| Dashboard | `/app` | Partially connected | Server backed workspace counts, recent documents, approval shortcut |
| Documents | `/app/documents` | UI ready | Search, status filter, upload dialog |
| Document detail | `/app/documents/:id` | UI ready | Metadata, version history, submit for approval |
| My documents | `/app/my-documents` | UI ready | Current user's owned documents |
| Approvals | `/app/approvals` | UI ready | Pending review queue |
| Approval review | `/app/approvals/:id` | UI ready | Version-specific preview, approve/reject comment |
| Team | `/app/team` | UI ready | Team list, invite UI, role selector |
| Activity | `/app/activity` | UI ready | Audit event list and type filters |
| Settings | `/app/settings` | UI ready | Workspace profile form |
| Landing | `/` | UI ready | Public product entry and demo CTA |
| Login | `/login` | UI ready | Sign-in form preview |
| Register | `/register` | UI ready | Employee registration form preview |
| Not found | `*` | UI ready | Invalid route state |
| Forbidden | Protected route | Planned | Access denied after server-backed role enforcement |

Upload is expected to be a modal/drawer from Documents and Dashboard rather than a separate route. Notifications and Trash are Phase 2.

## Shared component inventory

- **Layout**: `AppLayout`, `Sidebar`, and `Topbar` frame protected workspace pages.
- **UI primitives**: `Button`, `Field`, `Modal`, `PageTitle`, `StatusBadge`, `FileIcon`, and `EmptyState` are in place. Add table, loading, and error states during API integration.
- **Feature components**: Dashboard cards/recent list; document filters/list/metadata/version history/upload form; approval queue/review panel/comment form; team table/role selector; activity filters/event row; auth form and protected/role route guards.

Keep feature-specific components close to their feature. Promote a component into `components/ui` only when multiple features share the same behavior and visual rules.

## Source tree

```text
src/
  api/                         HTTP client and endpoint modules (next API integration phase)
  components/
    layout/                    AppLayout, Sidebar, Topbar
    ui/                        Reusable primitives and feedback states
  data/                        Seeded demo records (temporary)
  features/
    activity/                  Activity page and event components
    approvals/                 Queue and review components
    auth/                      Landing, login, and register UI
    dashboard/                 Dashboard page and summary cards
    documents/                 Explorer, details, versions, upload UI
    settings/                  Workspace preferences
    team/                      Team list and role management
  hooks/                       Shared React hooks (as needed)
  pages/                       Route selection and thin page boundaries
  routes/                      Protected and role route guards (planned)
  store/                       Auth/session state (planned)
  utils/                       Formatting and shared helpers (as needed)
  App.jsx
  main.jsx
```

The UI currently uses hash routes and in-memory demo state. Authentication and authorization are presentation-only until the API and route guards are implemented.
