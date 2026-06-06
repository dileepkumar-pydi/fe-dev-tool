export function AppIcon({ label, color = 'sky', active = false }) {
  const iconColorClass = `app-icon app-icon--${color}${active ? ' app-icon--active' : ''}`

  return <div className={iconColorClass}>{label}</div>
}
