import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/glass-theme.css'
import { AppShell } from './components/AppShell'
import { sidebarItems, toolPages } from './data/appContent'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { ToolPage } from './pages/ToolPage'
import { CategoryPage, NotFoundPage } from './pages/CategoryPage'
import { APP_ROUTES, normalizeHashRoute, toHash } from './utils/appRouter'

const itemRouteMap = Object.fromEntries(sidebarItems.map(({ id }) => [id, APP_ROUTES[id]]))

function App() {
  const [route, setRoute] = useState(() => normalizeHashRoute(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setRoute(normalizeHashRoute(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [route])

  const operationGroup = ['pdf', 'image'].find((id) => route.startsWith(`${APP_ROUTES[id]}/`))
  const operation = operationGroup ? route.slice(APP_ROUTES[operationGroup].length + 1) : ''
  const hasOperation = operationGroup && toolPages[operationGroup].operations.some((item) => item.id === operation)

  const activeItemId = useMemo(() => {
    const matchedEntry = Object.entries(itemRouteMap).find(([, itemRoute]) => itemRoute === route)
    return matchedEntry?.[0] ?? (route.startsWith('app/pdf/') ? 'pdf' : route.startsWith('app/image/') ? 'image' : route.startsWith('category/') ? route.split('/')[1] : '')
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
        <DashboardPage />
      </AppShell>
    )
  }

  if (route.startsWith('category/')) {
    return <AppShell sidebarItems={sidebarItems} activeItemId={activeItemId} onNavigate={handleNavigate}>
      <CategoryPage id={route.split('/')[1]} />
    </AppShell>
  }

  const toolKey = hasOperation ? operationGroup : Object.entries(itemRouteMap).find(([, itemRoute]) => itemRoute === route)?.[0]
  const toolPage = toolKey ? toolPages[toolKey] : null

  return (
    <AppShell sidebarItems={sidebarItems} activeItemId={activeItemId} onNavigate={handleNavigate}>
      {toolPage ? <ToolPage key={route} page={toolPage} operation={operation} /> : <NotFoundPage />}
    </AppShell>
  )
}

export default App
