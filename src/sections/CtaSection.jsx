import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

export function CtaSection() {
  return (
    <Section id="cta" centered tone="cta">
      <SectionHeading
        title="Ready to boost your workflow?"
        subtitle="Start using DevTools today. No signup required."
        largeTitle
      />

      <Button href="#categories" className="button--cta" withArrow>
        Launch Dashboard
      </Button>
    </Section>
  )
}
