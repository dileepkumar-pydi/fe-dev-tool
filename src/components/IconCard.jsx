export function IconCard({
  icon,
  title,
  description,
  count,
  variant = 'feature',
}) {
  const rootClass = variant === 'category' ? 'category-card' : 'info-card'
  const iconClass = variant === 'category' ? 'category-card__icon' : 'info-card__icon'
  const titleClass = variant === 'category' ? 'category-card__title' : 'info-card__title'
  const bodyClass = variant === 'category' ? 'category-card__count' : 'info-card__description'
  const bodyValue = variant === 'category' ? count : description

  return (
    <article className={rootClass}>
      <div className={iconClass}>{icon}</div>
      <h3 className={titleClass}>{title}</h3>
      <p className={bodyClass}>{bodyValue}</p>
    </article>
  )
}
