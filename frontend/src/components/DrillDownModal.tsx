import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { IconX } from '@/components/icons'
import type { SignalCard } from '@/data/mocks'
import { cn } from '@/lib/utils'
import { useForseen } from '@/store/forseen-context'

type Props = {
  open: boolean
  predictionId: number | null
  onOpenChange: (open: boolean) => void
}

export function DrillDownModal({ open, predictionId, onOpenChange }: Props) {
  const { displayPredictions, getPredictionDetail } = useForseen()
  const prediction = predictionId != null ? displayPredictions.find((p) => p.id === predictionId) : undefined
  const detail = predictionId != null ? getPredictionDetail(predictionId) : undefined

  if (!prediction || !detail) return null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[color:var(--color-accent-foreground)]/20 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-[min(80vw,960px)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-3xl border border-[color:var(--color-accent)]/20 bg-[color:var(--color-page)] p-6 shadow-lg focus:outline-none md:p-8',
          )}
        >
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--color-accent)]/15 bg-[color:var(--color-accent-muted)] px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-accent)]">
                Prediction detail
              </p>
              <DialogPrimitive.Title className="mt-1 text-xl font-light tracking-tight text-neutral-800">
                {prediction.topic}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close className="shrink-0 rounded-full p-2 text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent)]/10 hover:text-[color:var(--color-accent-hover)]">
              <IconX className="size-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="rounded-2xl border border-neutral-200/70 bg-[color:var(--color-elevated)] p-1">
            <Accordion
              key={predictionId}
              type="multiple"
              defaultValue={['k2', 'signals', 'counter']}
              className="w-full"
            >
              <AccordionItem value="k2" className="border-b border-[color:var(--color-accent)]/10 px-2">
                <AccordionTrigger className="rounded-xl px-3 py-3 text-neutral-800 hover:bg-[color:var(--color-accent-muted)]/70 hover:no-underline data-[state=open]:bg-[color:var(--color-accent-muted)]/50">
                  K2 Think v2 model reasoning
                </AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed text-neutral-700">{detail.k2Reasoning}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="signals" className="border-b border-[color:var(--color-accent)]/10 px-2">
                <AccordionTrigger className="rounded-xl px-3 py-3 text-neutral-800 hover:bg-[color:var(--color-accent-muted)]/70 hover:no-underline data-[state=open]:bg-[color:var(--color-accent-muted)]/50">
                  Key signals
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {detail.signals.map((s: SignalCard) => (
                      <div
                        key={s.title}
                        className="rounded-2xl border border-[color:var(--color-accent)]/18 bg-[color:var(--color-muted-surface)] p-4"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="text-sm font-light text-neutral-800">{s.title}</p>
                          <Badge
                            variant="outline"
                            className="shrink-0 border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent-muted)]/50 font-mono text-[10px] text-[color:var(--color-accent-foreground)]"
                          >
                            w={s.weight}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600">{s.summary}</p>
                        {s.sourceUrl !== '#' && (
                          <a
                            href={s.sourceUrl}
                            className="mt-2 inline-block text-xs font-light text-[color:var(--color-accent)] hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Source link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="counter" className="border-b-0 px-2">
                <AccordionTrigger className="rounded-xl px-3 py-3 text-neutral-800 hover:bg-[color:var(--color-accent-muted)]/70 hover:no-underline data-[state=open]:bg-[color:var(--color-accent-muted)]/50">
                  Counterfactors
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-inside list-disc space-y-2 rounded-xl border border-neutral-200/60 bg-[color:var(--color-muted-surface)] px-4 py-3 text-neutral-700">
                    {detail.counterfactors.map((c: string) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
