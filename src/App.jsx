import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { AppShell } from './components/AppShell'
import { sidebarItems, toolPages } from './data/appContent'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { ToolPage } from './pages/ToolPage'
import { APP_ROUTES, normalizeHashRoute, toHash } from './utils/appRouter'

const itemRouteMap = {
  dashboard: APP_ROUTES.dashboard,
  base64: APP_ROUTES.base64,
  json: APP_ROUTES.json,
  hash: APP_ROUTES.hash,
  timestamp: APP_ROUTES.timestamp,
  color: APP_ROUTES.color,
  file: APP_ROUTES.file,
}

function App() {
  const [route, setRoute] = useState(() => normalizeHashRoute(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setRoute(normalizeHashRoute(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const activeItemId = useMemo(() => {
    const matchedEntry = Object.entries(itemRouteMap).find(([, itemRoute]) => itemRoute === route)
    return matchedEntry?.[0] ?? 'dashboard'
  }, [route])

  const handleNavigate = (itemId) => {
    const nextRoute = itemRouteMap[itemId]
    if (nextRoute) {
      window.location.hash = toHash(nextRoute)
    }
  }

  if (route === APP_ROUTES.landing) {
    return <LandingPage />
  }

  if (route === APP_ROUTES.dashboard) {
    return (
      <AppShell sidebarItems={sidebarItems} activeItemId={activeItemId} onNavigate={handleNavigate}>
        <DashboardPage onOpenTool={handleNavigate} />
      </AppShell>
    )
  }

  const toolKey = Object.entries(itemRouteMap).find(([, itemRoute]) => itemRoute === route)?.[0]
  const toolPage = toolKey ? toolPages[toolKey] : null

  return (
    <AppShell sidebarItems={sidebarItems} activeItemId={activeItemId} onNavigate={handleNavigate}>
      {toolPage ? <ToolPage page={toolPage} /> : <DashboardPage onOpenTool={handleNavigate} />}
    </AppShell>
  )
}

export default App
