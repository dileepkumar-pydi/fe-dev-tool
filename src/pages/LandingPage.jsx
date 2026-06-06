import {
  apiPreview,
  categoryCards,
  featureCards,
  featuredTools,
} from '../data/landingContent'
import { ApiWorkflowSection } from '../sections/ApiWorkflowSection'
import { CategoriesSection } from '../sections/CategoriesSection'
import { CtaSection } from '../sections/CtaSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { Footer } from '../sections/Footer'
import { Header } from '../sections/Header'
import { HeroSection } from '../sections/HeroSection'

export function LandingPage() {
  return (
    <div className="page-shell">
      <Header />
      <main>
        <HeroSection featuredTools={featuredTools} />
        <FeaturesSection featureCards={featureCards} />
        <CategoriesSection categoryCards={categoryCards} />
        <ApiWorkflowSection apiPreview={apiPreview} />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
