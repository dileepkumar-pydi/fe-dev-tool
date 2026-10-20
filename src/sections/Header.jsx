import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { APP_ROUTES, toHash } from '../utils/appRouter'

export function Header() {
  return <header className="site-header">
    <div className="container site-header__inner">
      <a href={toHash(APP_ROUTES.landing)} className="brand-link" aria-label="DevTools home"><BrandLogo /></a>
      <nav className="site-nav" aria-label="Primary"><Button href={toHash(APP_ROUTES.dashboard)} size="small" variant="secondary" withArrow>Open workspace</Button></nav>
    </div>
  </header>
}
