import Button from '../../components/ui/Button.jsx'

const workflow = [
  ['01', 'Draft', 'Create a document and keep its current file attached.'],
  ['02', 'Review', 'Send a specific version to an approver.'],
  ['03', 'Approved', 'Record the decision and keep the version history.'],
]

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f3ed] text-[#171717]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="#/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 rotate-[-6deg] place-items-center border-[3px] border-[#171717] bg-[#ffdf4f] text-xl font-black shadow-[4px_4px_0_#171717]">
            TV
          </span>
          <span>
            <b className="block text-lg font-black uppercase">TrackVault</b>
            <small className="text-[9px] font-bold uppercase tracking-[0.2em]">
              Paperwork, handled.
            </small>
          </span>
        </a>
        <div className="flex gap-3">
          <Button variant="plain" onClick={() => onNavigate('/login')}>
            Sign in
          </Button>
          <Button variant="dark" onClick={() => onNavigate('/register')}>
            Create account
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <section>
          <span className="inline-block -rotate-2 border-2 border-[#171717] bg-[#ff6b5c] px-3 py-2 text-xs font-black uppercase">
            One place for every version
          </span>
          <h1 className="mt-7 max-w-3xl text-6xl font-black uppercase leading-[.86] tracking-[-0.07em] sm:text-8xl">
            Paperwork,
            <br />
            <span className="text-[#ff6b5c]">handled.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[#6c675f]">
            Keep important documents organized, route them for review, and know
            exactly which version is approved.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="dark" onClick={() => onNavigate('/register')}>
              Get started
            </Button>
            <Button variant="yellow" onClick={() => onNavigate('/login')}>
              Sign in to workspace
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-7 border-t-2 border-[#171717] pt-5">
            {[
              'One source of truth',
              'Clear approvals',
              'Accountable history',
            ].map((feature) => (
              <p key={feature} className="text-xs font-black uppercase">
                {feature}
              </p>
            ))}
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-4 -top-5 h-full w-full rotate-3 border-[3px] border-[#171717] bg-[#ffdf4f]" />
          <div className="relative border-[3px] border-[#171717] bg-white p-6 shadow-[8px_8px_0_#171717]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c675f]">
              A clear path from draft to decision
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase">
              Document lifecycle
            </h2>
            <div className="mt-6 space-y-3">
              {workflow.map(([number, state, description], index) => (
                <div
                  key={state}
                  className={`border-[2px] border-[#171717] p-4 ${index === 0 ? 'bg-[#ffdf4f]' : index === 1 ? 'bg-[#d6b5ff]' : 'bg-[#b8f36b]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center border-2 border-[#171717] bg-white text-xs font-black">
                      {number}
                    </span>
                    <b className="text-sm font-black uppercase">{state}</b>
                  </div>
                  <p className="mt-3 text-xs font-semibold">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t-2 border-[#171717] pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest">
                Every important action is recorded
              </p>
              <p className="mt-2 text-sm font-semibold text-[#6c675f]">
                See who uploaded, reviewed, and approved each version.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-[3px] border-[#171717] bg-[#ffdf4f] px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest">
        TrackVault | Document workflows for teams
      </footer>
    </div>
  )
}
