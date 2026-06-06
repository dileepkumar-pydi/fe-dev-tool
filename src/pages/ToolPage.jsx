import { SurfaceCard } from '../components/SurfaceCard'
import { ToolHeader } from '../components/ToolHeader'

export function ToolPage({ page }) {
  return (
    <div className="tool-page">
      <ToolHeader
        category={page.category}
        title={page.title}
        badge={page.badge}
        description={page.description}
      />

      {page.layout === 'dual-panels' ? <DualPanelsLayout page={page} /> : null}
      {page.layout === 'two-cards' ? <TwoCardsLayout page={page} /> : null}
      {page.layout === 'upload' ? <UploadLayout page={page} /> : null}

      {page.exampleSection ? <ExampleSection section={page.exampleSection} /> : null}
    </div>
  )
}

function DualPanelsLayout({ page }) {
  return (
    <div className="tool-grid">
      <SurfaceCard title={page.inputTitle}>
        {page.inputControls?.segmented ? (
          <div className="segmented-control">
            {page.inputControls.segmented.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`segmented-control__item${index === 0 ? ' segmented-control__item--active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        {page.form?.fields ? <FormFields fields={page.form.fields} /> : null}

        {page.inputControls?.textareaPlaceholder ? (
          <textarea className="tool-textarea" placeholder={page.inputControls.textareaPlaceholder} />
        ) : null}

        {page.inputControls?.actions ? (
          <div className="action-row action-row--split">
            {page.inputControls.actions.map((action, index) => (
              <button
                key={action}
                type="button"
                className={`tool-action${index === 0 ? ' tool-action--primary' : ''}`}
              >
                {action}
              </button>
            ))}
            <button type="button" className="tool-icon-button">
              {page.inputControls.secondaryAction}
            </button>
          </div>
        ) : null}

        {page.inputControls?.primaryAction ? (
          <div className="action-row">
            <button type="button" className="tool-action tool-action--primary">
              {page.inputControls.primaryAction}
            </button>
            <button type="button" className="tool-icon-button">
              {page.inputControls.secondaryAction}
            </button>
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard
        title={page.outputTitle}
        actions={
          page.layout === 'dual-panels' && page.category === 'Base64 Tools'
            ? (
              <>
                <button type="button" className="tool-header-icon">⇵</button>
                <button type="button" className="tool-header-icon">⧉</button>
              </>
              )
            : page.category === 'JSON Tools'
              ? <button type="button" className="tool-header-icon">⧉</button>
              : null
        }
      >
        <div className="output-panel">{page.outputPlaceholder || page.outputEmpty}</div>
      </SurfaceCard>
    </div>
  )
}

function TwoCardsLayout({ page }) {
  return (
    <div className="tool-grid">
      {page.cards.map((card) => (
        <SurfaceCard key={card.title} title={card.title}>
          <FormFields fields={card.fields} icon={card.icon} />
          <div className="action-row">
            <button type="button" className="tool-action tool-action--primary">
              {card.primaryAction}
            </button>
            <button type="button" className="tool-icon-button">
              {card.secondaryAction}
            </button>
          </div>
        </SurfaceCard>
      ))}
    </div>
  )
}

function UploadLayout({ page }) {
  return (
    <div className="tool-grid">
      <SurfaceCard title={page.upload.title}>
        <div className="upload-dropzone">
          <div className="upload-dropzone__icon">⇪</div>
          <div className="upload-dropzone__title">{page.upload.emptyTitle}</div>
          <div className="upload-dropzone__hint">{page.upload.emptyHint}</div>
          <button type="button" className="tool-action tool-action--primary tool-action--compact">
            {page.upload.action}
          </button>
        </div>
      </SurfaceCard>

      <SurfaceCard title={page.outputTitle}>
        <div className="output-empty">{page.outputEmpty}</div>
      </SurfaceCard>
    </div>
  )
}

function FormFields({ fields }) {
  return (
    <div className="form-fields">
      {fields.map((field) => (
        <div key={field.label} className="form-field">
          <label className="form-field__label">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea className="tool-textarea" placeholder={field.placeholder} />
          ) : null}
          {field.type === 'select' ? <div className="tool-input tool-input--select">{field.value}</div> : null}
          {field.type === 'input' ? <div className="tool-input">{field.value}</div> : null}
          {field.type === 'color-input' ? (
            <div className="color-input-row">
              <div className="tool-input">{field.value}</div>
              <div className="color-swatch color-swatch--small" style={{ backgroundColor: field.value }} />
            </div>
          ) : null}
          {field.type === 'swatch' ? (
            <div className="color-swatch color-swatch--large" style={{ backgroundColor: field.value }} />
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ExampleSection({ section }) {
  return (
    <SurfaceCard title={section.title} className="surface-card--full">
      {section.cards ? (
        <div className={`example-grid example-grid--${Math.min(section.cards.length, 4)}`}>
          {section.cards.map((card) => (
            <div key={card.title} className="example-card">
              <div className="example-card__title">{card.title}</div>
              <div className="example-card__body">{card.body}</div>
            </div>
          ))}
        </div>
      ) : null}

      {section.code ? <pre className="example-code">{section.code}</pre> : null}

      {section.palettes ? (
        <div className="palette-grid">
          {section.palettes.map((palette) => (
            <div key={palette.name} className="palette-card">
              <div className="palette-card__swatch" style={{ backgroundColor: palette.value }} />
              <div className="palette-card__name">{palette.name}</div>
              <div className="palette-card__value">{palette.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  )
}
