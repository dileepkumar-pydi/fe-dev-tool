export function Section({ children, id, centered = false, tone = 'default', className = '' }) {
  const classes = ['section', centered ? 'section--centered' : '', tone !== 'default' ? `section--${tone}` : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classes}>
      <div className="container">{children}</div>
    </section>
  )
}
