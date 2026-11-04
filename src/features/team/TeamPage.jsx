import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Field from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'
import PageTitle from '../../components/ui/PageTitle.jsx'

export default function TeamPage({
  members,
  onInvite,
  canInvite,
  canManageMembers,
  onUpdateRole,
  onUpdateStatus,
}) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [error, setError] = useState('')

  const updateMember = async (operation) => {
    setError('')
    try {
      await operation()
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const submitInvitation = async (event) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await onInvite({
        email: form.get('email'),
        phone: form.get('phone'),
        role: form.get('role'),
        department: form.get('department'),
      })
      setInviteUrl(result.inviteUrl)
      setWhatsappUrl(result.whatsappUrl)
      setInviteOpen(false)
    } catch (inviteError) {
      setError(inviteError.message)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle eyebrow="Workspace / People" title="Team" />
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>Invite a teammate</Button>
        )}
      </div>
      {inviteUrl && (
        <div className="mb-5 border-[3px] border-[#171717] bg-[#b8f36b] p-4">
          <p className="text-xs font-black uppercase">Invitation created</p>
          <p className="mt-1 text-sm font-semibold">
            Copy this one-time link and send it to the teammate. It expires in
            seven days.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={inviteUrl}
              className="min-w-0 flex-1 border-2 border-[#171717] bg-white px-3 py-2 text-xs"
              aria-label="Invitation link"
            />
            <Button
              variant="plain"
              onClick={() => navigator.clipboard.writeText(inviteUrl)}
            >
              Copy link
            </Button>
          </div>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex border-[3px] border-[#171717] bg-[#b8f36b] px-5 py-3 text-xs font-black uppercase shadow-[3px_3px_0_#171717]"
            >
              Open WhatsApp message
            </a>
          )}
        </div>
      )}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ['Active members', members.filter((member) => member.isActive).length, 'bg-white'],
          [
            'Team leaders',
            members.filter((member) => member.isActive && member.role === 'approver').length,
            'bg-[#d6b5ff]',
          ],
          [
            'Members',
            members.filter((member) => member.isActive && member.role === 'employee').length,
            'bg-[#b8f36b]',
          ],
        ].map(([label, count, color]) => (
          <div
            key={label}
            className={`border-[3px] border-[#171717] ${color} p-4`}
          >
            <p className="text-[10px] font-black uppercase">{label}</p>
            <b className="mt-2 block text-3xl">{count}</b>
          </div>
        ))}
      </div>
      {members.length ? (
        <div className="overflow-x-auto border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead className="bg-[#ffdf4f]">
              <tr className="border-b-[3px] border-[#171717] text-[10px] font-black uppercase">
                <th className="p-4">Person</th>
                <th className="p-4">Workspace role</th>
                <th className="p-4">Department</th>
                {canManageMembers && <th className="p-4">Access</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={`border-b-2 border-[#171717] last:border-0 ${member.isActive ? '' : 'bg-[#f1eee9] text-[#77736d]'}`}
                >
                  <td className="p-4">
                    <b className="block text-sm">{member.name}{!member.isActive && ' · Inactive'}</b>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs text-[#6c675f] underline"
                    >
                      {member.email}
                    </a>
                  </td>
                  <td className="p-4 text-xs font-black uppercase">
                    {canManageMembers ? (
                      <select
                        aria-label={`Role for ${member.name}`}
                        value={member.role}
                        onChange={(event) =>
                          updateMember(() => onUpdateRole(member.id, event.target.value))
                        }
                        className="border-2 border-[#171717] bg-white px-2 py-2 text-xs font-black uppercase"
                      >
                        <option value="employee">Member</option>
                        <option value="approver">Team Leader</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : member.role === 'approver' ? 'Team Leader' : member.role}
                  </td>
                  <td className="p-4 text-xs font-semibold">
                    {member.department || 'Not assigned'}
                  </td>
                  {canManageMembers && (
                    <td className="p-4">
                      <Button
                        variant="plain"
                        onClick={() => updateMember(() => onUpdateStatus(member.id, !member.isActive))}
                      >
                        {member.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No teammates yet"
          description="Invite a teammate to connect them to this workspace."
        />
      )}
      {error && !inviteOpen && (
        <p role="alert" className="mt-4 text-xs font-black text-[#bd2f21]">
          {error}
        </p>
      )}
      {inviteOpen && (
        <Modal title="Invite a teammate" onClose={() => setInviteOpen(false)}>
          <form className="space-y-4" onSubmit={submitInvitation}>
            <Field
              label="Work email"
              name="email"
              type="email"
              required
              placeholder="person@company.com"
            />
            <Field
              label="WhatsApp number with country code"
              name="phone"
              type="tel"
              required
              placeholder="+91 98765 43210"
            />
            <label className="block text-xs font-black uppercase">
              Workspace role
              <select
                name="role"
                className="mt-2 block w-full border-[3px] border-[#171717] bg-white px-3 py-3 text-sm font-semibold"
              >
                <option value="employee">Member</option>
                <option value="approver">Team Leader</option>
              </select>
            </label>
            <Field
              label="Department"
              name="department"
              placeholder="Optional"
            />
            {error && (
              <p role="alert" className="text-xs font-black text-[#bd2f21]">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              Create invitation link
            </Button>
          </form>
        </Modal>
      )}
    </>
  )
}
