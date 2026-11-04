import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'

export default function AuthPage({
  mode = 'login',
  onNavigate,
  onSubmit,
  invitationToken,
  invitedEmail,
  invitationDetails,
}) {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isLogin = mode === 'login'
  return (
    <main className="grid min-h-screen bg-[#f7f3ed] text-[#171717] lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-[#ffdf4f] p-7 sm:p-12">
        <a
          href="#/"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('/')
          }}
          className="flex w-fit items-center gap-3"
        >
          <span className="grid h-11 w-11 rotate-[-6deg] place-items-center border-[3px] border-[#171717] bg-[#171717] text-2xl text-[#ffdf4f]">
            ▦
          </span>
          <span>
            <b className="block text-lg font-black uppercase">TrackVault</b>
            <small className="text-[9px] font-bold uppercase tracking-[0.2em]">
              Paperwork, handled.
            </small>
          </span>
        </a>
        <div className="my-14 max-w-lg">
          <p className="text-xs font-black uppercase tracking-[0.2em]">
            Your documents, in order
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[.9] tracking-[-0.06em] sm:text-7xl">
            A clearer
            <br />
            way to
            <br />
            <span className="text-[#ff6b5c]">work.</span>
          </h1>
          <p className="mt-5 max-w-sm font-semibold text-[#514d46]">
            Version history, clear reviews, and a record of every decision.
          </p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest">
          TrackVault · Workspace access
        </p>
      </section>
      <section className="grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <span className="inline-block border-2 border-[#171717] bg-[#d6b5ff] px-2 py-1 text-[10px] font-black uppercase">
            {isLogin ? 'Welcome back' : 'New workspace member'}
          </span>
          <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.05em]">
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#6c675f]">
            {isLogin
              ? 'Use your work email to continue.'
              : invitationDetails
                ? `Join ${invitationDetails.organizationName} as ${invitationDetails.role}.`
                : 'Create a new account to set up a workspace.'}
          </p>
          {invitationDetails && (
            <div className="mt-4 border-2 border-[#171717] bg-[#ffdf4f] p-3 text-xs font-black uppercase">
              Invitation for {invitationDetails.email}
            </div>
          )}
          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault()
              setError('')
              setSubmitting(true)
              try {
                await onSubmit(event)
              } catch (submitError) {
                setError(submitError.message)
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {invitationToken && (
              <input
                type="hidden"
                name="invitationToken"
                value={invitationToken}
              />
            )}
            {!isLogin && (
              <Field
                label="Full name"
                name="name"
                autoComplete="name"
                required
                placeholder="Your name"
              />
            )}
            <Field
              label="Work email"
              type="email"
              name="email"
              autoComplete="email"
              required
              defaultValue={invitedEmail}
              readOnly={Boolean(invitationToken)}
              placeholder="you@company.com"
            />
            <Field
              label="Password"
              type="password"
              name="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      'Password reset will be available after authentication is connected.',
                    )
                  }
                  className="text-xs font-black underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {notice && (
              <p role="status" className="text-xs font-semibold text-[#6c675f]">
                {notice}
              </p>
            )}
            {error && (
              <p role="alert" className="text-xs font-black text-[#bd2f21]">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="dark"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? 'Connecting...'
                : isLogin
                  ? 'Sign in to workspace →'
                  : invitationDetails
                    ? 'Accept invitation and join →'
                    : 'Create account →'}
            </Button>
          </form>
          <div className="mt-6 border-2 border-[#171717] bg-white p-3 text-xs font-semibold text-[#6c675f]">
            Sign-in uses the TrackVault API. Documents and other workspace data
            will be connected in later steps.
          </div>
          <p className="mt-6 text-center text-sm font-semibold">
            {isLogin ? 'New to TrackVault?' : 'Already have an account?'}{' '}
            <button
              className="font-black underline"
              onClick={() => onNavigate(isLogin ? '/register' : '/login')}
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="mt-6 w-full text-center text-xs font-black uppercase tracking-wider"
          >
            ← Back to home
          </button>
        </div>
      </section>
    </main>
  )
}
