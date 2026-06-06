import { AppIcon } from './AppIcon'

export function MetricCard({ label, value, icon, accent }) {
  return (
    <article className="metric-card">
      <div>
        <div className="metric-card__label">{label}</div>
        <div className="metric-card__value">{value}</div>
      </div>
      <AppIcon label={icon} color={accent} />
    </article>
  )
}
