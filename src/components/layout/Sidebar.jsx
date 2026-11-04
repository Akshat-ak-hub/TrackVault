const workspaceLinks = [
  ['Dashboard', '/app', '▦'],
  ['Documents', '/app/documents', '▤'],
  ['My documents', '/app/my-documents', '◫'],
  ['Approvals', '/app/approvals', '✓'],
  ['Activity', '/app/activity', '↯'],
]
const manageLinks = [
  ['Team', '/app/team', '♟'],
  ['Settings', '/app/settings', '⚙'],
]

export default function Sidebar({
  activePath,
  onNavigate,
  menuOpen,
  onClose,
  pendingCount,
  role,
}) {
  const linkClass = (path) =>
    `flex w-full items-center gap-3 border-[3px] border-[#171717] px-3 py-3 text-left text-[11px] font-black uppercase transition-all ${activePath === path ? 'bg-[#171717] text-[#ffdf4f] shadow-[4px_4px_0_#fff]' : 'bg-transparent hover:translate-x-1'}`
  const links = (items) =>
    items.map(([label, path, icon]) => (
      <a
        key={path}
        href={`#${path}`}
        onClick={(event) => {
          event.preventDefault()
          onNavigate(path)
          onClose()
        }}
        className={linkClass(path)}
      >
        <span className="w-5 text-lg">{icon}</span>
        {label}
        {label === 'Approvals' && pendingCount > 0 && (
          <span className="ml-auto bg-[#ff6b5c] px-2 py-0.5 text-xs text-[#171717]">
            {pendingCount}
          </span>
        )}
      </a>
    ))

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${menuOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r-[3px] border-[#171717] bg-[#ffdf4f] p-5 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-10 flex items-center justify-between">
          <a
            href="#/app"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('/app')
            }}
            className="flex items-center gap-3"
          >
            <span className="grid h-11 w-11 rotate-[-6deg] place-items-center border-[3px] border-[#171717] bg-[#171717] text-2xl text-[#ffdf4f] shadow-[4px_4px_0_#fff]">
              ▦
            </span>
            <span>
              <strong className="block text-xl font-black uppercase leading-none">
                TrackVault
              </strong>
              <small className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em]">
                Paperwork, handled.
              </small>
            </span>
          </a>
          <button
            className="text-2xl lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          Workspace
        </p>
        <nav className="space-y-2">
          {links(
            workspaceLinks.filter(
              ([label]) =>
                label !== 'Approvals' || ['admin', 'approver'].includes(role),
            ),
          )}
        </nav>
        <p className="mb-3 mt-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          Manage
        </p>
        <nav className="space-y-2">{links(manageLinks)}</nav>
        <div className="mt-auto border-[3px] border-[#171717] bg-[#f7f3ed] p-4 shadow-[5px_5px_0_#171717]">
          <p className="text-[10px] font-black uppercase">File storage</p>
          <p className="mt-2 text-xs font-semibold text-[#6c675f]">
            Connect storage to upload and download files.
          </p>
        </div>
      </aside>
    </>
  )
}
