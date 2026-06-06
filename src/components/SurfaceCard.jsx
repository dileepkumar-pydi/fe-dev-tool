export function SurfaceCard({ title, actions, children, className = '' }) {
  return (
    <section className={`surface-card ${className}`.trim()}>
      <div className="surface-card__header">
        <h3 className="surface-card__title">{title}</h3>
        {actions ? <div className="surface-card__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
