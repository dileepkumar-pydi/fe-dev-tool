import { BrandLogo } from './BrandLogo'
import { Button } from './Button'
import { SearchIcon } from './SearchIcon'
import { AppSidebar } from './AppSidebar'
import { APP_ROUTES, toHash } from '../utils/appRouter'

export function AppShell({ children, sidebarItems, activeItemId, onNavigate }) {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <a href={toHash(APP_ROUTES.landing)} className="brand-link" aria-label="Go to DevTools home">
            <BrandLogo />
          </a>
        </div>
        <AppSidebar items={sidebarItems} activeItemId={activeItemId} onNavigate={onNavigate} />
        <div className="app-shell__sidebar-footer">
          <div>DevTools v1.0</div>
          <div>API-powered utilities</div>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-topbar">
          <button type="button" className="app-topbar__menu" aria-label="Toggle menu">
            ☰
          </button>

          <label className="app-topbar__search">
            <SearchIcon />
            <input type="text" placeholder="Search tools..." />
          </label>

          <div className="app-topbar__actions">
            <Button
              variant="secondary"
              size="small"
              href="https://dev-tool-service.onrender.com/v1/dev-tool/swagger-ui/index.html#"
            >
              Documentation
            </Button>
            <Button size="small">API Key</Button>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
