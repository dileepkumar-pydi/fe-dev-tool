import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { APP_ROUTES, toHash } from '../utils/appRouter'

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#" className="brand-link" aria-label="DevTools home">
          <BrandLogo />
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href={toHash(APP_ROUTES.dashboard)} className="site-nav__link">
            Dashboard
          </a>
          <Button href={toHash(APP_ROUTES.dashboard)} size="small">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  )
}
