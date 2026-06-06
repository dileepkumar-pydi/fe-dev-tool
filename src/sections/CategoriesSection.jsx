import { CardGrid } from '../components/CardGrid'
import { CategoryCard } from '../components/CategoryCard'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

export function CategoriesSection({ categoryCards }) {
  return (
    <Section id="categories" centered>
      <SectionHeading title="Browse by Category" subtitle="Organized tools for every development need" />
      <CardGrid columns="four" className="section-stack">
          {categoryCards.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
      </CardGrid>
    </Section>
  )
}
