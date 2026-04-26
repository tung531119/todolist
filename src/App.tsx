import { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DayView } from './components/views/DayView'
import { WeekView } from './components/views/WeekView'
import { MonthView } from './components/views/MonthView'
import { TemplatesView } from './components/views/TemplatesView'
import { SettingsView } from './components/views/SettingsView'
import { useStore } from './store'

export default function App() {
  const viewMode = useStore(s => s.ui.viewMode)
  const setViewMode = useStore(s => s.setViewMode)

  const [activePage, setActivePage] = useState<string>(viewMode)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  function handleNavigate(id: string) {
    setActivePage(id)
    if (id === 'day' || id === 'week' || id === 'month') {
      setViewMode(id as any)
    }
  }

  useEffect(() => {
    if (activePage !== 'templates' && activePage !== 'settings') {
      setActivePage(viewMode)
    }
  }, [viewMode])

  const isNarrowView = activePage === 'templates' || activePage === 'settings'
    || viewMode === 'week' || viewMode === 'month'

  function renderContent() {
    if (activePage === 'templates') return <TemplatesView />
    if (activePage === 'settings') return <SettingsView />
    if (viewMode === 'week') return <WeekView />
    if (viewMode === 'month') return <MonthView />
    return <DayView />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activePage={activePage} onMenuClick={() => setMobileSidebarOpen(v => !v)} />

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          <div className={cn(isNarrowView && 'max-w-2xl mx-auto', 'animate-fade-in')}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
