import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#" className="brand-link" aria-label="DevTools home">
          <BrandLogo />
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#categories" className="site-nav__link">
            Dashboard
          </a>
          <Button href="#cta">Get Started</Button>
        </nav>
      </div>
    </header>
  )
}
