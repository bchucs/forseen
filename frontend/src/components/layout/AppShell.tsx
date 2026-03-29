import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { IconChevronRight, LogoGithub } from '@/components/icons'
import { useForseen, type AppView } from '@/store/forseen-context'
import { Dashboard } from '@/screens/Dashboard'
import { RagChatScreen } from '@/screens/RagChatScreen'
import { SetupScreen } from '@/screens/SetupScreen'
import { RegulatoryAnalysisScreen } from '@/screens/RegulatoryAnalysisScreen'
import { DrillDownModal } from '@/components/DrillDownModal'

const EXTERNAL_LINKS = {
  github: 'https://github.com/xyaei/YHack-2026',
  devpost: 'https://devpost.com/',
} as const

const nav: { id: AppView; label: string }[] = [
  { id: 'rag', label: 'Chat' },
  { id: 'setup', label: 'Setup' },
]

export function AppShell() {
  const { company, activeView, setActiveView, drillPredictionId, setDrillPredictionId } = useForseen()
  const [dashPanelOpen, setDashPanelOpen] = React.useState(true)

  // Redirect stale 'dashboard' view to 'rag' (dashboard now only lives as a side panel)
  React.useEffect(() => {
    if (activeView === 'dashboard') setActiveView('rag')
  }, [activeView, setActiveView])

  const onNav = (id: AppView) => {
    setActiveView(id)
  }

  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col bg-[color:var(--color-page)] text-neutral-800',
        (activeView === 'setup' || activeView === 'analysis') && 'h-dvh overflow-hidden',
        activeView === 'rag' && 'h-dvh overflow-hidden',
      )}
    >
      {/* Top navbar */}
      <header className={cn('sticky top-0 z-40 shrink-0 border-b border-neutral-200/50 bg-[color:var(--color-elevated)]', activeView === 'analysis' && 'hidden')}>
        <div className="flex items-center gap-4 px-4 py-2.5 md:px-6">
          {/* Brand */}
          <div className="min-w-0 shrink-0">
            <p className="text-sm font-medium tracking-tight text-neutral-800">Forseen</p>
            <p className="hidden text-[10px] font-light leading-snug text-neutral-500 sm:block">
              {company.name} · {company.industry}
            </p>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-light transition-colors',
                  activeView === item.id
                    ? 'bg-[color:var(--color-accent)] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800',
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Dashboard toggle (only in chat view, desktop) */}
          {activeView === 'rag' && (
            <button
              type="button"
              onClick={() => setDashPanelOpen((o) => !o)}
              className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200/80 px-3 py-1.5 text-xs font-light text-neutral-600 transition-colors hover:bg-neutral-100 md:inline-flex"
            >
              <IconChevronRight className={cn('size-3.5 transition-transform duration-200', dashPanelOpen && 'rotate-180')} aria-hidden />
              {dashPanelOpen ? 'Hide dashboard' : 'Dashboard'}
            </button>
          )}

          {/* External links */}
          <div className="flex items-center gap-1">
            <a
              href={EXTERNAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="GitHub"
            >
              <LogoGithub className="size-4" aria-hidden />
            </a>
            <a
              href={EXTERNAL_LINKS.devpost}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Devpost"
            >
              <img src="/devpost-logo.png" alt="" width={16} height={16} className="size-4 object-contain" draggable={false} />
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className={cn(
          'min-w-0 flex-1',
          activeView === 'setup'
            ? 'flex min-h-0 flex-col overflow-hidden px-5 py-4 pb-2 md:px-10 md:py-5 md:pb-3 lg:px-14'
            : activeView === 'analysis'
              ? 'min-h-0 overflow-y-auto'
              : activeView === 'rag'
                ? 'flex min-h-0 overflow-hidden p-0'
                : 'px-4 py-6 md:px-8 md:py-8',
        )}
      >
        {activeView === 'rag' ? (
          <div className="flex w-full flex-1 min-h-0 overflow-hidden">
            {/* Chat */}
            <div className="w-full min-w-0 flex-1 flex flex-col overflow-hidden">
              <RagChatScreen />
            </div>
            {/* Dashboard side panel — desktop only */}
            <AnimatePresence>
              {dashPanelOpen && (
                <motion.div
                  key="dashboard-panel"
                  initial={{ flexBasis: 0, opacity: 0 }}
                  animate={{ flexBasis: '45%', opacity: 1 }}
                  exit={{ flexBasis: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="hidden shrink-0 overflow-hidden border-l border-neutral-200/50 bg-[color:var(--color-page)] md:flex md:flex-col"
                  style={{ minWidth: 0 }}
                >
                  <div className="h-full w-full overflow-y-auto px-6 py-6">
                    <Dashboard />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : activeView === 'setup' ? (
          <SetupScreen />
        ) : activeView === 'analysis' ? (
          <RegulatoryAnalysisScreen />
        ) : null}
      </main>

      <DrillDownModal open={drillPredictionId != null} predictionId={drillPredictionId} onOpenChange={(o) => !o && setDrillPredictionId(null)} />
    </div>
  )
}
