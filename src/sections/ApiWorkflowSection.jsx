import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'

export function ApiWorkflowSection({ apiPreview }) {
  return (
    <Section>
      <div className="workflow-panel">
        <SectionHeading
          title="API-First Workflow"
          subtitle="Every tool provides structured API responses with status codes, messages, and data payloads for seamless integration."
          wideSubtitle
        />

        <div className="code-block">
          <pre>
            <code>{apiPreview}</code>
          </pre>
        </div>
      </div>
    </Section>
  )
}
