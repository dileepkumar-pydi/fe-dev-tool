import { BrandLogo } from './BrandLogo'
import { Button } from './Button'
import { useEffect, useState } from 'react'
import { ToolSearch } from './ToolSearch'
import { AppSidebar } from './AppSidebar'
import { APP_ROUTES, toHash } from '../utils/appRouter'

export function AppShell({ children, sidebarItems, activeItemId, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  const navigate = (id) => { onNavigate(id); setMenuOpen(false) }
  return (
    <div className={`app-shell${menuOpen ? ' app-shell--menu-open' : ''}`}>
      {menuOpen && <button className="app-shell__overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <aside id="tool-sidebar" className="app-shell__sidebar">
        <div className="app-shell__brand">
          <a href={toHash(APP_ROUTES.landing)} className="brand-link" aria-label="Go to DevTools home">
            <BrandLogo />
          </a>
        </div>
        <AppSidebar items={sidebarItems} activeItemId={activeItemId} onNavigate={navigate} />
        <div className="app-shell__sidebar-footer">
          <div>DevTools</div>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-topbar">
          <button type="button" className="app-topbar__menu" aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="tool-sidebar" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>

          <ToolSearch />

          <div className="app-topbar__actions">
            <Button
              variant="secondary"
              size="small"
              href="https://dev-tool-service.onrender.com/v1/dev-tool/swagger-ui/index.html#"
            >
              Documentation
            </Button>

          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
