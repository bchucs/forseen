import type { Confidence, Effort, Prediction, PredictionDetail } from '@/data/mocks'
import type { ApiPrediction } from '@/lib/api'

export const LIVE_PREDICTION_ID = 1

function mapConfidence(c: string): Confidence {
  const x = c.toLowerCase()
  if (x === 'high') return 'High'
  if (x === 'medium') return 'Medium'
  return 'Low'
}

function tripleRequirements(reqs: string[]): [string, string, string] {
  const a = reqs[0] ?? '—'
  const b = reqs[1] ?? reqs[0] ?? '—'
  const c = reqs[2] ?? reqs[1] ?? reqs[0] ?? '—'
  return [a, b, c]
}

export function apiPredictionToUi(pred: ApiPrediction, id = LIVE_PREDICTION_ID): Prediction {
  const j = typeof pred.jurisdiction === 'string' ? pred.jurisdiction : ''
  return {
    id,
    topic: typeof pred.topic === 'string' ? pred.topic : '—',
    jurisdictions: j.includes(',')
      ? j.split(',').map((s) => s.trim()).filter(Boolean)
      : [j || '—'],
    prob6mo: pred.probability_6mo,
    prob12mo: pred.probability_12mo,
    prob24mo: pred.probability_24mo,
    confidence: mapConfidence(pred.confidence),
    requirements: tripleRequirements(pred.likely_requirements),
  }
}

function findSourceUrl(signalId: string, signals: Record<string, unknown>[]): string {
  const needle = signalId.toLowerCase()
  // Exact match first
  for (const s of signals) {
    if (typeof s.title === 'string' && s.title.toLowerCase() === needle) {
      return s.source_url as string
    }
  }
  // Substring match: signal title contains the id or vice versa
  for (const s of signals) {
    if (typeof s.title === 'string') {
      const hay = s.title.toLowerCase()
      if (hay.includes(needle) || needle.includes(hay)) {
        return s.source_url as string
      }
    }
  }
  return '#'
}

export function apiPredictionToDetail(
  pred: ApiPrediction,
  signals: Record<string, unknown>[] = [],
  predictionId: number = LIVE_PREDICTION_ID,
): PredictionDetail {
  const keySignals = Array.isArray(pred.key_signals) ? pred.key_signals : []
  const prep = Array.isArray(pred.recommended_preparation) ? pred.recommended_preparation : []
  const counter = Array.isArray(pred.counterfactors) ? pred.counterfactors : []
  return {
    predictionId,
    k2Reasoning: typeof pred.reasoning === 'string' ? pred.reasoning : '',
    signals: keySignals.map((ks) => ({
      title: typeof ks.signal_id === 'string' ? ks.signal_id : '—',
      summary: typeof ks.rationale === 'string' ? ks.rationale : '',
      sourceUrl: findSourceUrl(typeof ks.signal_id === 'string' ? ks.signal_id : '', signals),
      weight: typeof ks.weight === 'number' ? ks.weight.toFixed(2) : '0.00',
    })),
    counterfactors: counter,
    prepActions: prep.map((title, i) => ({
      step: i + 1,
      title: typeof title === 'string' ? title : '—',
      effort: 'Med' as Effort,
    })),
  }
}

export function priorityActionsFromReport(
  actions: { priority: string; action: string; deadline: string; effort: string }[],
): { label: string; level: 'High' | 'Med' | 'Low' }[] {
  return actions.map((a) => {
    const p = (a.priority ?? '').toLowerCase()
    return {
      label: a.action,
      level: p === 'high' ? 'High' : p === 'low' ? 'Low' : 'Med',
    }
  })
}
