import { CardGrid } from '../components/CardGrid'
import { Section } from '../components/Section'
import { FeatureCard } from '../components/FeatureCard'

export function FeaturesSection({ featureCards }) {
  return (
    <Section>
      <CardGrid columns="three">
        {featureCards.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </CardGrid>
    </Section>
  )
}
