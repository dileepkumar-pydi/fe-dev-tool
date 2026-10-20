import { ToolDirectory } from '../components/ToolDirectory'
import { Footer } from '../sections/Footer'
import { Header } from '../sections/Header'
import { HeroSection } from '../sections/HeroSection'

export function LandingPage() {
  return <div className="page-shell landing-page">
    <Header />
    <main>
      <HeroSection />
      <section className="landing-tools" aria-labelledby="landing-tools-title">
        <div className="container">
          <div className="landing-tools__heading"><h2 id="landing-tools-title">Pick a tool. Get it done.</h2><p>Open a tool and start working.</p></div>
          <ToolDirectory />
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
