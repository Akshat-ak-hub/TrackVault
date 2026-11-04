export default function Topbar({
  title,
  user,
  memberships,
  activeOrganizationId,
  onSwitchOrganization,
  onOpenMenu,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center gap-4 border-b-[3px] border-[#171717] bg-[#f7f3ed]/95 px-5 backdrop-blur sm:px-8">
      <button
        className="border-[3px] border-[#171717] bg-[#ffdf4f] px-3 py-2 text-xl shadow-[3px_3px_0_#171717] lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        ☰
      </button>
      <div className="hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#6c675f] sm:flex">
        {memberships.length > 1 ? (
          <select
            aria-label="Switch workspace"
            value={activeOrganizationId}
            onChange={(event) => onSwitchOrganization(event.target.value)}
            className="max-w-52 border-2 border-[#171717] bg-white px-2 py-2 text-[10px] font-black uppercase text-[#171717]"
          >
            {memberships.map((membership) => (
              <option
                key={membership.organizationId}
                value={membership.organizationId}
              >
                {membership.organizationName}
              </option>
            ))}
          </select>
        ) : (
          <span>{user.organizationName}</span>
        )}
        / <span className="text-[#171717]">{title}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          className="relative grid h-10 w-10 place-items-center border-[3px] border-[#171717] bg-white text-lg shadow-[3px_3px_0_#171717]"
          aria-label="Notifications"
        >
          ♢
          <span className="absolute -right-1 -top-1 h-3 w-3 border-2 border-[#171717] bg-[#ff6b5c]" />
        </button>
        <div className="flex items-center gap-2 border-l-[3px] border-[#171717] pl-3">
          <div className="grid h-10 w-10 place-items-center border-[3px] border-[#171717] bg-[#d6b5ff] font-black">
            {user.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black">{user.name}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#6c675f]">
              {user.role}
            </p>
            <button
              onClick={onLogout}
              className="text-[9px] font-black uppercase tracking-wider underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
