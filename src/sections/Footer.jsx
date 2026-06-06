import { BrandLogo } from '../components/BrandLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <BrandLogo />
        <p className="site-footer__copy">© 2026 DevTools. All rights reserved.</p>
      </div>
    </footer>
  )
}
