import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import { organizationsApi } from '../../api/organizations.api.js'

export default function InvitationLandingPage({
  token,
  user,
  onRegister,
  onLogin,
  onAccept,
}) {
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    organizationsApi
      .invitationDetails(token)
      .then(({ invitation }) => setDetails(invitation))
      .catch((lookupError) => setError(lookupError.message))
  }, [token])

  const accept = async () => {
    setError('')
    setBusy(true)
    try {
      await onAccept(token, details.organizationId)
    } catch (acceptError) {
      setError(acceptError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3ed] p-6 text-[#171717]">
      <section className="w-full max-w-lg border-[3px] border-[#171717] bg-white p-7 shadow-[7px_7px_0_#ffdf4f] sm:p-10">
        <span className="inline-block border-2 border-[#171717] bg-[#ffdf4f] px-2 py-1 text-[10px] font-black uppercase">
          Workspace invitation
        </span>
        {details ? (
          <>
            <h1 className="mt-4 text-3xl font-black uppercase">
              Join {details.organizationName}
            </h1>
            <p className="mt-3 text-sm font-semibold text-[#6c675f]">
              {details.email} is invited as a{' '}
              <b>{details.role === 'approver' ? 'Team Leader' : 'Member'}</b>
              {details.department ? ` in ${details.department}` : ''}.
            </p>
            {user ? (
              <Button className="mt-7 w-full" onClick={accept} disabled={busy}>
                {busy ? 'Joining...' : 'Accept invitation'}
              </Button>
            ) : (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => onRegister(token, details.email, details)}
                >
                  Create account
                </Button>
                <Button
                  variant="yellow"
                  onClick={() => onLogin(token, details.email, details)}
                >
                  Sign in
                </Button>
              </div>
            )}
          </>
        ) : !error ? (
          <p className="mt-5 text-sm font-semibold">Checking invitation...</p>
        ) : (
          <p className="mt-5 text-sm font-semibold text-[#bd2f21]">{error}</p>
        )}
        {error && details && (
          <p role="alert" className="mt-4 text-xs font-black text-[#bd2f21]">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}
