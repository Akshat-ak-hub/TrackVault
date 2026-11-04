import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'

export default function WorkspaceSetupPage({ onCreate }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const form = new FormData(event.currentTarget)
      await onCreate(form.get('name'))
    } catch (createError) {
      setError(createError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3ed] p-6 text-[#171717]">
      <section className="w-full max-w-xl border-[3px] border-[#171717] bg-white p-7 shadow-[7px_7px_0_#ffdf4f] sm:p-10">
        <span className="inline-block border-2 border-[#171717] bg-[#d6b5ff] px-2 py-1 text-[10px] font-black uppercase">
          Workspace setup
        </span>
        <h1 className="mt-4 text-4xl font-black uppercase">
          Create your company workspace
        </h1>
        <p className="mt-3 text-sm font-semibold text-[#6c675f]">
          You will be its admin. Invite team leaders and members after setup.
        </p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <Field
            label="Company or organization name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Your organization"
          />
          {error && (
            <p role="alert" className="text-xs font-black text-[#bd2f21]">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Creating...' : 'Create workspace'}
          </Button>
        </form>
        <p className="mt-5 text-xs font-semibold text-[#6c675f]">
          Already invited to a workspace? Open the invitation link you received.
        </p>
      </section>
    </main>
  )
}
