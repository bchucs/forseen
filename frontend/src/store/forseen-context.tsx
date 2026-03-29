import * as React from 'react'
import { toast } from 'sonner'
import { defaultCompany, mocks, type Company, type Prediction, type PredictionDetail } from '@/data/mocks'
import type { AnalyzeResponse } from '@/lib/api'
import { postAnalyze } from '@/lib/api'
import {
  apiPredictionToDetail,
  apiPredictionToUi,
  LIVE_PREDICTION_ID,
  priorityActionsFromReport,
} from '@/lib/prediction-mapper'

export type AppView = 'dashboard' | 'rag' | 'setup'

type PriorityRow = { label: string; level: 'High' | 'Med' | 'Low' }

type ForseenContextValue = {
  company: Company
  setCompany: (c: Company) => void
  activeView: AppView
  setActiveView: (v: AppView) => void
  drillPredictionId: number | null
  setDrillPredictionId: (id: number | null) => void
  loading: boolean
  setLoading: (v: boolean) => void
  refreshMocks: () => void
  alertDone: Record<string, boolean>
  toggleAlertDone: (id: string) => void
  markAllAlertsDone: () => void
  priorityActionsChecked: Record<number, boolean>
  togglePriorityAction: (index: number) => void
  /** Regulatory topic for /analyze (e.g. "Healthcare privacy") */
  riskTopic: string
  setRiskTopic: (t: string) => void
  /** Jurisdiction code or label for /analyze (e.g. "CA") */
  riskJurisdiction: string
  setRiskJurisdiction: (j: string) => void
  lastAnalyze: AnalyzeResponse | null
  analyzeLoading: boolean
  analyzeError: string | null
  runAnalyze: () => Promise<void>
  /** Predictions for dashboard: live row when lastAnalyze is set */
  displayPredictions: Prediction[]
  /** Signals count for dashboard card */
  signalsTrackedCount: number
  /** Priority actions: Hermes report when live, else static teaser */
  priorityRows: PriorityRow[]
  getPredictionDetail: (id: number) => PredictionDetail | undefined
}

const ForseenContext = React.createContext<ForseenContextValue | null>(null)

const defaultPriorityRows: PriorityRow[] = [
  { label: 'Audit data flows across PHI stores', level: 'High' },
  { label: 'Refresh BAAs with audit clauses', level: 'High' },
  { label: 'Publish CDS model cards', level: 'Med' },
]

export function ForseenProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = React.useState<Company>({ ...defaultCompany })
  const [activeView, setActiveView] = React.useState<AppView>('setup')
  const [drillPredictionId, setDrillPredictionId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [alertDone, setAlertDone] = React.useState<Record<string, boolean>>({})
  const [priorityActionsChecked, setPriorityActionsChecked] = React.useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  })
  const [riskTopic, setRiskTopic] = React.useState('State health data privacy')
  const [riskJurisdiction, setRiskJurisdiction] = React.useState('CA')
  const [lastAnalyze, setLastAnalyze] = React.useState<AnalyzeResponse | null>(null)
  const [analyzeLoading, setAnalyzeLoading] = React.useState(false)
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null)

  const liveDetail = React.useMemo(
    () => (lastAnalyze ? apiPredictionToDetail(lastAnalyze.prediction) : undefined),
    [lastAnalyze],
  )

  const displayPredictions = React.useMemo((): Prediction[] => {
    if (lastAnalyze) return [apiPredictionToUi(lastAnalyze.prediction)]
    return mocks.predictions
  }, [lastAnalyze])

  const signalsTrackedCount = React.useMemo(() => {
    if (lastAnalyze) return lastAnalyze.signals_used
    return 24
  }, [lastAnalyze])

  const priorityRows = React.useMemo((): PriorityRow[] => {
    if (lastAnalyze?.report?.priority_actions?.length) {
      return priorityActionsFromReport(lastAnalyze.report.priority_actions).slice(0, 8)
    }
    return defaultPriorityRows
  }, [lastAnalyze])

  const getPredictionDetail = React.useCallback(
    (id: number): PredictionDetail | undefined => {
      if (lastAnalyze && id === LIVE_PREDICTION_ID) return liveDetail
      return mocks.predictionDetails[id as keyof typeof mocks.predictionDetails]
    },
    [lastAnalyze, liveDetail],
  )

  const refreshMocks = React.useCallback(() => {
    setLoading(true)
    window.setTimeout(() => {
      setCompany({ ...defaultCompany })
      setAlertDone({})
      setPriorityActionsChecked({ 0: false, 1: false, 2: false })
      setLastAnalyze(null)
      setAnalyzeError(null)
      setLoading(false)
    }, 900)
  }, [])

  const runAnalyze = React.useCallback(async () => {
    setAnalyzeLoading(true)
    setAnalyzeError(null)
    try {
      const res = await postAnalyze(company, riskTopic, riskJurisdiction)
      setLastAnalyze(res)
      toast.success('Analysis complete')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed'
      setAnalyzeError(msg)
      toast.error(msg)
    } finally {
      setAnalyzeLoading(false)
    }
  }, [company, riskTopic, riskJurisdiction])

  const toggleAlertDone = React.useCallback((id: string) => {
    setAlertDone((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const markAllAlertsDone = React.useCallback(() => {
    const next: Record<string, boolean> = {}
    for (const a of mocks.alerts) next[a.id] = true
    setAlertDone(next)
  }, [])

  const togglePriorityAction = React.useCallback((index: number) => {
    setPriorityActionsChecked((prev) => ({ ...prev, [index]: !prev[index] }))
  }, [])

  const value = React.useMemo(
    () => ({
      company,
      setCompany,
      activeView,
      setActiveView,
      drillPredictionId,
      setDrillPredictionId,
      loading,
      setLoading,
      refreshMocks,
      alertDone,
      toggleAlertDone,
      markAllAlertsDone,
      priorityActionsChecked,
      togglePriorityAction,
      riskTopic,
      setRiskTopic,
      riskJurisdiction,
      setRiskJurisdiction,
      lastAnalyze,
      analyzeLoading,
      analyzeError,
      runAnalyze,
      displayPredictions,
      signalsTrackedCount,
      priorityRows,
      getPredictionDetail,
    }),
    [
      company,
      activeView,
      drillPredictionId,
      loading,
      refreshMocks,
      alertDone,
      toggleAlertDone,
      markAllAlertsDone,
      priorityActionsChecked,
      togglePriorityAction,
      riskTopic,
      riskJurisdiction,
      lastAnalyze,
      analyzeLoading,
      analyzeError,
      runAnalyze,
      displayPredictions,
      signalsTrackedCount,
      priorityRows,
      getPredictionDetail,
    ],
  )

  return <ForseenContext.Provider value={value}>{children}</ForseenContext.Provider>
}

export function useForseen() {
  const ctx = React.useContext(ForseenContext)
  if (!ctx) throw new Error('useForseen must be used within ForseenProvider')
  return ctx
}
