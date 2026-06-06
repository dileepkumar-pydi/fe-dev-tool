export function CardGrid({ children, columns = 'three', className = '' }) {
  const classes = ['card-grid', `card-grid--${columns}`, className].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}
