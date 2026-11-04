import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import PageTitle from '../../components/ui/PageTitle.jsx'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  return (
    <>
      <PageTitle eyebrow="Manage / Workspace" title="Settings" />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setSaved(true)
          }}
          className="border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]"
        >
          <div className="border-b-[3px] border-[#171717] bg-[#ffdf4f] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.15em]">
              Workspace profile
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase">
              Organization details
            </h2>
          </div>
          <div className="space-y-5 p-5">
            <Field
              label="Organization name"
              name="organization"
              defaultValue=""
              placeholder="Your organization"
              required
            />
            <Field
              label="Default approval deadline"
              name="deadline"
              placeholder="e.g. 5 business days"
            />
            <label className="block text-xs font-black uppercase">
              Default document visibility
              <select className="mt-2 block w-full border-[3px] border-[#171717] bg-white px-3 py-3 text-sm font-semibold">
                <option>Department members</option>
                <option>Workspace members</option>
                <option>Document owner only</option>
              </select>
            </label>
            {saved && (
              <p
                role="status"
                className="text-xs font-black uppercase text-green-800"
              >
                Changes are saved for this browser session only.
              </p>
            )}
            <Button type="submit">Save changes</Button>
          </div>
        </form>
        <aside className="h-fit border-[3px] border-[#171717] bg-[#d6b5ff] p-5 shadow-[5px_5px_0_#171717]">
          <p className="text-[10px] font-black uppercase tracking-widest">
            Workspace configuration
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase">Not connected</h2>
          <p className="mt-5 border-2 border-[#171717] bg-white p-3 text-[10px] font-semibold">
            These preferences will save to the workspace when the settings API
            is implemented.
          </p>
        </aside>
      </div>
    </>
  )
}
