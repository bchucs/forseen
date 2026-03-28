import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useForseen } from '@/store/forseen-context'

const industries = ['Healthcare SaaS', 'FinTech', 'Manufacturing', 'Retail', 'Other']
const allStates = ['CA', 'NY', 'TX', 'FL', 'WA', 'IL']
const dataTypes = ['PHI', 'PII', 'AI outputs', 'Financial']

export function SetupScreen() {
  const { company, setCompany, setActiveView } = useForseen()
  const [step, setStep] = React.useState(1)
  const [name, setName] = React.useState(company.name)
  const [description, setDescription] = React.useState(company.description)
  const [industry, setIndustry] = React.useState(company.industry)
  const [employees, setEmployees] = React.useState([company.employees])
  const [states, setStates] = React.useState<string[]>(company.states)
  const [dts, setDts] = React.useState<string[]>(company.dataTypes)
  const [models, setModels] = React.useState(company.usesModels)
  const [cPrivacy, setCPrivacy] = React.useState(true)
  const [cAi, setCAi] = React.useState(true)
  const [cHipaa, setCHipaa] = React.useState(true)

  React.useEffect(() => {
    setName(company.name)
    setDescription(company.description)
    setIndustry(company.industry)
    setEmployees([company.employees])
    setStates(company.states)
    setDts(company.dataTypes)
    setModels(company.usesModels)
  }, [company])

  const toggleState = (s: string) => {
    setStates((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const toggleDt = (d: string) => {
    setDts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const saveProfile = () => {
    const concerns: string[] = []
    if (cPrivacy) concerns.push('Privacy')
    if (cAi) concerns.push('AI Regs')
    if (cHipaa) concerns.push('HIPAA')

    setCompany({
      name,
      description: description.trim(),
      industry,
      employees: employees[0],
      states: states.length ? states : ['CA'],
      dataTypes: dts.length ? dts : ['PII'],
      usesModels: models,
      concerns: concerns.length ? concerns : ['Privacy'],
    })
    toast.success('Profile saved — demo banner updated')
  }

  const goToDashboard = () => setActiveView('dashboard')
  const goToRag = () => setActiveView('rag')

  return (
    <div className="mx-auto w-full max-w-lg px-2 py-6 md:py-10">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-light tracking-tight text-neutral-800">Business profile setup</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {step <= 3 ? `Step ${step} of 3` : 'All set'} — all data stays in this browser.
        </p>
      </div>

      {step <= 3 && (
        <>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="co-name">Company name</Label>
                <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-desc">What does your company do?</Label>
                <Textarea
                  id="co-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your company in a sentence or two."
                  rows={3}
                  className="min-h-[88px] resize-y"
                />
                <p className="text-xs text-neutral-500">A short description helps tailor the demo narrative.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-ind">Industry</Label>
                <select
                  id="co-ind"
                  className="flex h-11 w-full rounded-2xl border border-neutral-200/80 bg-[color:var(--color-elevated)] px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {industries.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Employees</Label>
                  <span className="text-sm tabular-nums text-neutral-600">{employees[0]}</span>
                </div>
                <Slider value={employees} onValueChange={setEmployees} min={10} max={100} step={5} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-light">States (multi-select)</p>
                <div className="flex flex-wrap gap-2">
                  {allStates.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleState(s)}
                      className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                        states.includes(s)
                          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-muted)] text-[color:var(--color-accent-foreground)]'
                          : 'border-neutral-200/80 bg-[color:var(--color-elevated)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-light">Data types</p>
                <div className="flex flex-wrap gap-2">
                  {dataTypes.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDt(d)}
                      className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                        dts.includes(d)
                          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-muted)] text-[color:var(--color-accent-foreground)]'
                          : 'border-neutral-200/80 bg-[color:var(--color-elevated)]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={models} onCheckedChange={(v) => setModels(v === true)} />
                Model usage in production
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-light">Concerns</p>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={cPrivacy} onCheckedChange={(v) => setCPrivacy(v === true)} />
                Privacy
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={cAi} onCheckedChange={(v) => setCAi(v === true)} />
                AI regulations
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={cHipaa} onCheckedChange={(v) => setCHipaa(v === true)} />
                HIPAA
              </label>
              <div className="rounded-2xl border border-neutral-200/60 bg-[color:var(--color-muted-surface)] p-4 text-sm">
                <p className="font-light text-neutral-800">Review</p>
                <p className="mt-3 text-neutral-600">
                  {name} · {industry} · {employees[0]} employees
                </p>
                {description.trim() && <p className="mt-2 text-neutral-600">{description.trim()}</p>}
                <p className="mt-1 text-neutral-600">States: {states.join(', ') || '—'}</p>
                <p className="mt-1 text-neutral-600">Data: {dts.join(', ') || '—'}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < 3 ? (
                <Button type="button" variant="accent" onClick={() => setStep((s) => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  onClick={() => {
                    saveProfile()
                    setStep(4)
                  }}
                >
                  Save &amp; continue
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/60 bg-[color:var(--color-muted-surface)] p-6 text-center">
            <p className="text-lg font-light text-neutral-800">Profile ready</p>
            <p className="mt-2 text-sm text-neutral-600">Choose where to start in the demo.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="accent" className="h-auto min-h-14 flex-col gap-1 py-4" onClick={goToDashboard}>
              <span className="text-base font-light">Dashboard</span>
              <span className="text-xs font-normal opacity-90">Predictions &amp; company overview</span>
            </Button>
            <Button type="button" variant="secondary" className="h-auto min-h-14 flex-col gap-1 border-neutral-200 py-4" onClick={goToRag}>
              <span className="text-base font-light">Chat</span>
              <span className="text-xs font-normal text-neutral-600">Ask questions over your data</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
