import { Breadcrumbs } from './Breadcrumbs'

export function ToolHeader({ category, title, badge, description }) {
  return (
    <div className="tool-header">
      <Breadcrumbs items={['Dashboard', category, title]} />
      <div className="tool-header__title-row">
        <h1 className="tool-header__title">{title}</h1>
        {badge ? <span className="tool-header__badge">{badge}</span> : null}
      </div>
      <p className="tool-header__description">{description}</p>
    </div>
  )
}
