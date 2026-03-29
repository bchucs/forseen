import * as DialogPrimitive from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-[min(80vw,960px)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-3xl border border-neutral-200/60 bg-[color:var(--color-elevated)] p-8 shadow-none focus:outline-none',
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-light uppercase tracking-wider text-neutral-500">Prediction detail</p>
              <DialogPrimitive.Title className="mt-1 text-xl font-light tracking-tight">{prediction.topic}</DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
              <IconX className="size-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>


          <Accordion
            key={predictionId}
            type="multiple"
            defaultValue={['k2', 'signals', 'counter', 'prep']}
            className="w-full"
          >
            <AccordionItem value="k2">
              <AccordionTrigger>K2 Think v2 model reasoning</AccordionTrigger>
              <AccordionContent>
                <p className="leading-relaxed text-neutral-700">{detail.k2Reasoning}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => toast.message('Model output would open here (demo)', { duration: 4000 })}
                >
                  Open model output
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="signals">
              <AccordionTrigger>Key signals</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detail.signals.map((s: SignalCard) => (
                    <div key={s.title} className="rounded-2xl border border-neutral-200/60 bg-[color:var(--color-elevated)] p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-light">{s.title}</p>
                        <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
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
            <AccordionItem value="counter">
              <AccordionTrigger>Counterfactors</AccordionTrigger>
              <AccordionContent>
                <ul className="list-inside list-disc space-y-1 text-neutral-700">
                  {detail.counterfactors.map((c: string) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
