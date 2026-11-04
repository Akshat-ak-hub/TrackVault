import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppLayout({
  activePath,
  title,
  user,
  memberships,
  activeOrganizationId,
  onSwitchOrganization,
  pendingCount,
  menuOpen,
  onNavigate,
  onCloseMenu,
  onOpenMenu,
  onLogout,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#171717]">
      <Sidebar
        activePath={activePath}
        pendingCount={pendingCount}
        role={user.role}
        menuOpen={menuOpen}
        onNavigate={onNavigate}
        onClose={onCloseMenu}
      />
      <main className="min-h-screen lg:ml-72">
        <Topbar
          title={title}
          user={user}
          memberships={memberships}
          activeOrganizationId={activeOrganizationId}
          onSwitchOrganization={onSwitchOrganization}
          onOpenMenu={onOpenMenu}
          onLogout={onLogout}
        />
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
