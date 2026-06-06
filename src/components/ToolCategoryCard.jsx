import { AppIcon } from './AppIcon'

export function ToolCategoryCard({ title, description, count, icon, color, onClick, highlighted = false }) {
  return (
    <button
      type="button"
      className={`tool-category-card${highlighted ? ' tool-category-card--highlighted' : ''}`}
      onClick={onClick}
    >
      <div className="tool-category-card__left">
        <AppIcon label={icon} color={color} />
        <div>
          <div className="tool-category-card__title">{title}</div>
          <div className="tool-category-card__description">{description}</div>
        </div>
      </div>
      <span className="tool-category-card__count">{count}</span>
    </button>
  )
}
