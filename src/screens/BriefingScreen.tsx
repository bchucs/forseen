import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { mocks } from '@/data/mocks'
export function BriefingScreen() {
  const [busy, setBusy] = React.useState(false)
  const report = mocks.reports[0]

  const regenerate = () => {
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      toast.success('Briefing regenerated (demo)')
    }, 1100)
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-neutral-200/60 bg-[color:var(--color-elevated)] p-6 pb-8 shadow-none md:p-8">
      <header className="space-y-3 border-b border-neutral-200/60 pb-6">
        <p className="text-xs font-light uppercase tracking-wider text-neutral-500">Weekly briefing</p>
        <h1 className="text-3xl font-light tracking-tight text-neutral-800 md:text-4xl">{report.headline}</h1>
        <p className="text-base leading-relaxed text-neutral-700">{report.execSummary}</p>
      </header>

      <Accordion type="multiple" defaultValue={report.sections.map((s) => s.id)} className="w-full">
        {report.sections.map((s) => (
          <AccordionItem key={s.id} value={s.id}>
            <AccordionTrigger>{s.title}</AccordionTrigger>
            <AccordionContent>
              <p className="leading-relaxed text-neutral-700">{s.body}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <footer className="flex flex-col gap-4 border-t border-neutral-200/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">{report.generatedLabel}</p>
        <Button variant="accent" disabled={busy} onClick={regenerate}>
          {busy ? 'Working…' : 'Regenerate'}
        </Button>
      </footer>
    </article>
  )
}
