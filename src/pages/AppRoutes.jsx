import { useEffect, useState } from 'react'
import { authApi } from '../api/auth.api.js'
import { documentsApi } from '../api/documents.api.js'
import { organizationsApi } from '../api/organizations.api.js'
import { activityApi } from '../api/activity.api.js'
import AppLayout from '../components/layout/AppLayout.jsx'
import Button from '../components/ui/Button.jsx'
import ActivityPage from '../features/activity/ActivityPage.jsx'
import ApprovalReviewPage from '../features/approvals/ApprovalReviewPage.jsx'
import ApprovalsPage from '../features/approvals/ApprovalsPage.jsx'
import AuthPage from '../features/auth/AuthPage.jsx'
import InvitationLandingPage from '../features/organizations/InvitationLandingPage.jsx'
import LandingPage from '../features/auth/LandingPage.jsx'
import DashboardPage from '../features/dashboard/DashboardPage.jsx'
import DocumentDetailPage from '../features/documents/DocumentDetailPage.jsx'
import DocumentsPage from '../features/documents/DocumentsPage.jsx'
import MyDocumentsPage from '../features/documents/MyDocumentsPage.jsx'
import UploadDocumentModal from '../features/documents/UploadDocumentModal.jsx'
import WorkspaceSetupPage from '../features/organizations/WorkspaceSetupPage.jsx'
import SettingsPage from '../features/settings/SettingsPage.jsx'
import TeamPage from '../features/team/TeamPage.jsx'

function currentRoute() {
  const route = window.location.hash.replace(/^#/, '')
  if (!route || route === '/') return '/'
  if (route === 'overview') return '/app'
  return route.startsWith('/') ? route : `/${route}`
}

function withInitials(account) {
  return {
    ...account,
    initials: account.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  }
}

function NotFoundPage({ onNavigate }) {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-7xl font-black text-[#ff6b5c]">404</p>
        <h1 className="mt-3 text-3xl font-black uppercase">Page not found</h1>
        <p className="mt-2 font-semibold text-[#6c675f]">
          That workspace route doesn&apos;t exist.
        </p>
        <Button className="mt-6" onClick={() => onNavigate('/app')}>
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}

function ForbiddenPage({ onNavigate }) {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-black text-[#ff6b5c]">403</p>
        <h1 className="mt-3 text-3xl font-black uppercase">Access denied</h1>
        <p className="mt-2 font-semibold text-[#6c675f]">
          Your workspace role does not allow this action.
        </p>
        <Button className="mt-6" onClick={() => onNavigate('/app')}>
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  const [route, setRoute] = useState(currentRoute)
  const [menuOpen, setMenuOpen] = useState(false)
  const [uploadTarget, setUploadTarget] = useState(null)
  const [documents, setDocuments] = useState([])
  const [activities, setActivities] = useState([])
  const [members, setMembers] = useState([])
  const [membersError, setMembersError] = useState('')
  const [authToken, setAuthToken] = useState(() =>
    window.sessionStorage.getItem('trackvault_token'),
  )
  const [authLoading, setAuthLoading] = useState(() =>
    Boolean(window.sessionStorage.getItem('trackvault_token')),
  )
  const [account, setAccount] = useState(null)
  const [activeOrganizationId, setActiveOrganizationId] = useState(() =>
    window.sessionStorage.getItem('trackvault_organization_id'),
  )
  const [pendingInvite, setPendingInvite] = useState(null)

  const navigate = (path) => {
    const next = path.startsWith('/') ? path : `/${path}`
    window.location.hash = `#${next}`
    setRoute(next)
    setMenuOpen(false)
  }

  useEffect(() => {
    const onChange = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    authApi
      .me()
      .then(({ user }) => {
        if (!cancelled) setAccount(withInitials(user))
      })
      .catch(() => {
        window.sessionStorage.removeItem('trackvault_token')
        setAuthToken(null)
        setAccount(null)
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  const memberships = account?.memberships ?? []
  const activeMembership =
    memberships.find(
      (membership) => membership.organizationId === activeOrganizationId,
    ) ?? memberships[0]
  const user =
    account && activeMembership
      ? {
          ...account,
          role: activeMembership.role,
          department: activeMembership.department,
          organizationId: activeMembership.organizationId,
          organizationName: activeMembership.organizationName,
        }
      : null

  useEffect(() => {
    if (!activeMembership) return
    if (activeMembership.organizationId !== activeOrganizationId) {
      window.sessionStorage.setItem(
        'trackvault_organization_id',
        activeMembership.organizationId,
      )
    }
  }, [activeMembership, activeOrganizationId])

  useEffect(() => {
    if (!user?.organizationId) return

    let cancelled = false
    organizationsApi
      .members(user.organizationId)
      .then(({ members: workspaceMembers }) => {
        if (!cancelled) {
          setMembers(workspaceMembers)
          setMembersError('')
        }
      })
      .catch((error) => {
        if (!cancelled) setMembersError(error.message)
      })

    return () => {
      cancelled = true
    }
  }, [user?.organizationId])

  const workspaceDocuments = user
    ? documents.filter(
        (document) => document.organizationId === user.organizationId,
      )
    : []
  const visibleDocuments =
    user?.role === 'employee'
      ? workspaceDocuments.filter((document) => document.ownerId === user.id)
      : workspaceDocuments
  const visibleActivities = user
    ? activities.filter(
        (activity) =>
          activity.organizationId === user.organizationId &&
          (user.role === 'admin' || activity.actorId === user.id),
      )
    : []

  useEffect(() => {
    if (!user?.organizationId) return

    let cancelled = false
    documentsApi
      .list()
      .then(({ documents: workspaceDocuments }) => {
        if (!cancelled) setDocuments(workspaceDocuments)
      })
      .catch((error) => {
        if (!cancelled)
          console.error('Could not load workspace documents:', error)
      })

    return () => {
      cancelled = true
    }
  }, [user?.organizationId, user?.id])

  useEffect(() => {
    if (!user?.organizationId) return
    let cancelled = false
    activityApi
      .list()
      .then(({ events }) => {
        if (!cancelled) setActivities(events)
      })
      .catch((error) => console.error('Could not load workspace activity:', error))
    return () => {
      cancelled = true
    }
  }, [user?.organizationId, documents, members])

  const previewRouteMatch = route.match(
    /^\/app\/(?:documents|approvals)\/([^/]+)$/,
  )
  const previewDocument = previewRouteMatch
    ? workspaceDocuments.find(
        (document) => document.id === previewRouteMatch[1],
      )
    : null

  useEffect(() => {
    if (!previewDocument?.fileUrl || previewDocument.previewUrl) return
    let cancelled = false
    let objectUrl = null
    let completed = false
    documentsApi
      .file(previewDocument.id, previewDocument.version)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        completed = true
        setDocuments((all) =>
          all.map((item) =>
            item.id === previewDocument.id
              ? { ...item, previewUrl: objectUrl }
              : item,
          ),
        )
      })
      .catch((error) =>
        console.error('Could not load document preview:', error),
      )

    return () => {
      cancelled = true
      if (objectUrl && !completed) URL.revokeObjectURL(objectUrl)
    }
  }, [
    previewDocument?.id,
    previewDocument?.version,
    previewDocument?.fileUrl,
    previewDocument?.previewUrl,
  ])

  const addActivity = (type, action, entity, color = 'bg-[#d6b5ff]') => {
    if (!user) return
    setActivities((all) => [
      {
        id: `act-${Date.now()}`,
        organizationId: user.organizationId,
        type,
        actorId: user.id,
        initials: user.initials,
        actor: user.name,
        action,
        entity,
        time: 'Just now',
        color,
      },
      ...all,
    ])
  }

  const uploadDocument = async (payload) => {
    if (!user) return
    const formData = new FormData()
    formData.set('file', payload.file)
    formData.set('note', payload.note ?? '')
    if (uploadTarget?.id) {
      const { document } = await documentsApi.addVersion(
        uploadTarget.id,
        formData,
      )
      setDocuments((all) =>
        all.map((item) => (item.id === document.id ? document : item)),
      )
      addActivity(
        'Uploads',
        `uploaded version ${uploadTarget.version + 1} of`,
        uploadTarget.title,
        'bg-[#ffbd59]',
      )
      return
    }
    formData.set('title', payload.title)
    formData.set('category', payload.category)
    formData.set('description', payload.description ?? '')
    formData.set('tags', JSON.stringify(payload.tags ?? []))
    const { document: newDocument } = await documentsApi.upload(formData)
    setDocuments((all) => [newDocument, ...all])
    addActivity('Uploads', 'uploaded', payload.title, 'bg-[#ffbd59]')
    navigate(`/app/documents/${newDocument.id}`)
  }

  const decideApproval = async (id, status, comment) => {
    const document = workspaceDocuments.find((item) => item.id === id)
    if (!document || !user) return
    const { document: updatedDocument } = await documentsApi.decide(
      id,
      status,
      comment,
    )
    setDocuments((all) =>
      all.map((item) => (item.id === id ? updatedDocument : item)),
    )
    addActivity(
      'Approvals',
      status === 'Approved' ? 'approved' : 'rejected',
      `${document.title} · v${document.version}${comment ? ` · ${comment}` : ''}`,
    )
  }

  const submitForApproval = async (id) => {
    const document = visibleDocuments.find((item) => item.id === id)
    if (!document) return
    const { document: submittedDocument } = await documentsApi.submit(id)
    setDocuments((all) =>
      all.map((item) => (item.id === id ? submittedDocument : item)),
    )
    addActivity(
      'Approvals',
      'submitted',
      `${document.title} · v${document.version}`,
      'bg-[#ffbd59]',
    )
  }

  const createWorkspace = async (name) => {
    const { membership } = await organizationsApi.create(name)
    const { user: refreshedAccount } = await authApi.me()
    setAccount(withInitials(refreshedAccount))
    setActiveOrganizationId(membership.organizationId)
    window.sessionStorage.setItem(
      'trackvault_organization_id',
      membership.organizationId,
    )
    navigate('/app')
  }

  const inviteMember = async (details) => {
    const { invitation } = await organizationsApi.invite(
      user.organizationId,
      details,
    )
    addActivity('Users', 'created a workspace invitation for', details.email)
    return invitation
  }

  const updateMemberRole = async (memberId, role) => {
    const { member } = await organizationsApi.updateMemberRole(
      user.organizationId,
      memberId,
      role,
    )
    setMembers((all) => all.map((item) => (item.id === member.id ? member : item)))
  }

  const updateMemberStatus = async (memberId, isActive) => {
    const { member } = await organizationsApi.updateMemberStatus(
      user.organizationId,
      memberId,
      isActive,
    )
    setMembers((all) => all.map((item) => (item.id === member.id ? member : item)))
  }

  const switchOrganization = (organizationId) => {
    setActiveOrganizationId(organizationId)
    window.sessionStorage.setItem('trackvault_organization_id', organizationId)
    setUploadTarget(null)
  }

  const acceptInvitation = async (token, organizationId) => {
    await organizationsApi.acceptInvitation(token)
    const { user: refreshedAccount } = await authApi.me()
    setAccount(withInitials(refreshedAccount))
    const joinedOrganizationId =
      organizationId ??
      refreshedAccount.memberships.at(-1)?.organizationId ??
      refreshedAccount.memberships[0]?.organizationId
    if (joinedOrganizationId) {
      setActiveOrganizationId(joinedOrganizationId)
      window.sessionStorage.setItem(
        'trackvault_organization_id',
        joinedOrganizationId,
      )
    }
    setPendingInvite(null)
    navigate('/app')
  }

  const submitAuth = async (event) => {
    const form = new FormData(event.currentTarget)
    const credentials = {
      email: form.get('email'),
      password: form.get('password'),
    }
    const invitationToken =
      form.get('invitationToken') || pendingInvite?.token || undefined
    let response =
      route === '/register'
        ? await authApi.register({
            ...credentials,
            name: form.get('name'),
            invitationToken,
          })
        : await authApi.login(credentials)

    window.sessionStorage.setItem('trackvault_token', response.token)
    setAuthToken(response.token)
    if (route !== '/register' && invitationToken) {
      await organizationsApi.acceptInvitation(invitationToken)
      response = await authApi.me()
      response = {
        ...response,
        token: window.sessionStorage.getItem('trackvault_token'),
      }
    }

    setAccount(withInitials(response.user))
    const joinedOrganizationId =
      pendingInvite?.details.organizationId ??
      response.user.memberships[0]?.organizationId ??
      null
    if (joinedOrganizationId) {
      setActiveOrganizationId(joinedOrganizationId)
      window.sessionStorage.setItem(
        'trackvault_organization_id',
        joinedOrganizationId,
      )
    }
    setPendingInvite(null)
    navigate('/app')
  }

  const inviteMatch = route.match(/^\/invite\/([^/]+)$/)
  if (route === '/') return <LandingPage onNavigate={navigate} />
  if (route === '/login') {
    return (
      <AuthPage
        mode="login"
        onNavigate={navigate}
        onSubmit={submitAuth}
        invitationToken={pendingInvite?.token}
        invitedEmail={pendingInvite?.email}
        invitationDetails={pendingInvite?.details}
      />
    )
  }
  if (route === '/register') {
    return (
      <AuthPage
        mode="register"
        onNavigate={navigate}
        onSubmit={submitAuth}
        invitationToken={pendingInvite?.token}
        invitedEmail={pendingInvite?.email}
        invitationDetails={pendingInvite?.details}
      />
    )
  }
  if (inviteMatch && authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f3ed]">
        <p className="text-sm font-black uppercase">
          Restoring your session...
        </p>
      </div>
    )
  }
  if (inviteMatch) {
    return (
      <InvitationLandingPage
        token={inviteMatch[1]}
        user={account}
        onRegister={(token, email, details) => {
          setPendingInvite({ token, email, details })
          navigate('/register')
        }}
        onLogin={(token, email, details) => {
          setPendingInvite({ token, email, details })
          navigate('/login')
        }}
        onAccept={(token, organizationId) =>
          acceptInvitation(token, organizationId)
        }
      />
    )
  }

  if (route.startsWith('/app') && authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f3ed]">
        <p className="text-sm font-black uppercase">
          Restoring your session...
        </p>
      </div>
    )
  }
  if (route.startsWith('/app') && !account) {
    return <AuthPage mode="login" onNavigate={navigate} onSubmit={submitAuth} />
  }
  if (route.startsWith('/app') && account.memberships.length === 0) {
    return <WorkspaceSetupPage onCreate={createWorkspace} />
  }
  if (route.startsWith('/app') && !user) {
    return <WorkspaceSetupPage onCreate={createWorkspace} />
  }

  const documentMatch = route.match(/^\/app\/documents\/([^/]+)$/)
  const reviewMatch = route.match(/^\/app\/approvals\/([^/]+)$/)
  const needsApprover = route === '/app/approvals' || Boolean(reviewMatch)
  const forbidden = needsApprover && !['approver', 'admin'].includes(user.role)
  const pageInfo = {
    '/app': [
      'Dashboard',
      <DashboardPage
        key="dashboard"
        documents={visibleDocuments}
        user={user}
        onNavigate={navigate}
        onUpload={() => setUploadTarget({ id: null })}
      />,
    ],
    '/app/documents': [
      'Documents',
      <DocumentsPage
        key="documents"
        documents={visibleDocuments}
        onNavigate={navigate}
        onUpload={() => setUploadTarget({ id: null })}
      />,
    ],
    '/app/my-documents': [
      'My documents',
      <MyDocumentsPage
        key="my-documents"
        documents={visibleDocuments}
        user={user}
        onNavigate={navigate}
        onUpload={() => setUploadTarget({ id: null })}
      />,
    ],
    '/app/approvals': [
      'Approvals',
      <ApprovalsPage key="approvals" documents={workspaceDocuments} onNavigate={navigate} />,
    ],
    '/app/team': [
      'Team',
      <TeamPage
        key="team"
        members={members}
        onInvite={inviteMember}
        canInvite={['admin', 'approver'].includes(user.role)}
        canManageMembers={user.role === 'admin'}
        onUpdateRole={updateMemberRole}
        onUpdateStatus={updateMemberStatus}
      />,
    ],
    '/app/activity': [
      'Activity',
      <ActivityPage key="activity" activities={visibleActivities} />,
    ],
    '/app/settings': ['Settings', <SettingsPage key="settings" />],
  }
  if (documentMatch) {
    const document = visibleDocuments.find(
      (item) => item.id === documentMatch[1],
    )
    pageInfo[route] = [
      document?.title ?? 'Document',
      <DocumentDetailPage
        key={route}
        document={document}
        onNavigate={navigate}
        onUpload={() => setUploadTarget(document ?? { id: null })}
        onSubmit={submitForApproval}
      />,
    ]
  }
  if (reviewMatch) {
    const document = workspaceDocuments.find(
      (item) => item.id === reviewMatch[1],
    )
    pageInfo[route] = [
      'Review',
      <ApprovalReviewPage
        key={route}
        document={document}
        onNavigate={navigate}
        onDecision={decideApproval}
      />,
    ]
  }

  const [title, page] = forbidden
    ? ['Access denied', <ForbiddenPage key="forbidden" onNavigate={navigate} />]
    : (pageInfo[route] ?? ['Not found', <NotFoundPage key="not-found" onNavigate={navigate} />])
  const activePath = route.startsWith('/app/documents')
    ? '/app/documents'
    : route.startsWith('/app/approvals')
      ? '/app/approvals'
      : route
  const uploadDocumentTarget = uploadTarget?.id
    ? workspaceDocuments.find((document) => document.id === uploadTarget.id)
    : null
  const pendingCount = workspaceDocuments.filter(
    (document) => document.status === 'Pending',
  ).length

  return (
    <>
      <AppLayout
        activePath={activePath}
        title={title}
        user={user}
        memberships={memberships}
        activeOrganizationId={user.organizationId}
        onSwitchOrganization={switchOrganization}
        pendingCount={pendingCount}
        menuOpen={menuOpen}
        onNavigate={navigate}
        onCloseMenu={() => setMenuOpen(false)}
        onOpenMenu={() => setMenuOpen(true)}
        onLogout={() => {
          window.sessionStorage.removeItem('trackvault_token')
          window.sessionStorage.removeItem('trackvault_organization_id')
          setAuthToken(null)
          setAccount(null)
          setActiveOrganizationId(null)
          setMembers([])
          setMembersError('')
          setDocuments([])
          setActivities([])
          navigate('/login')
        }}
      >
        {membersError && route === '/app/team' ? (
          <p
            role="alert"
            className="border-2 border-[#171717] bg-[#ffbd59] p-4 text-sm font-black"
          >
            {membersError}
          </p>
        ) : (
          page
        )}
      </AppLayout>
      {uploadTarget && (
        <UploadDocumentModal
          document={uploadDocumentTarget}
          onClose={() => setUploadTarget(null)}
          onUpload={uploadDocument}
        />
      )}
    </>
  )
}
