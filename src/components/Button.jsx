import { ArrowIcon } from './ArrowIcon'

export function Button({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'default',
  withArrow = false,
  className = '',
}) {
  const classes = ['button', `button--${variant}`, size !== 'default' ? `button--${size}` : '', className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
        {withArrow ? <ArrowIcon /> : null}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {withArrow ? <ArrowIcon /> : null}
    </button>
  )
}
