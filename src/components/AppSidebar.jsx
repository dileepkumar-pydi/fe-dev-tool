import { AppIcon } from './AppIcon'

const colorMap = {
  dashboard: 'sky',
  web: 'teal',
  jwt: 'amber',
  regex: 'purple',
  diff: 'green',
  base64: 'sky',
  json: 'pink',
  hash: 'green',
  text: 'orange',
  timestamp: 'rose',
  number: 'indigo',
  escape: 'teal',
  uuid: 'purple',
  color: 'purple',
  file: 'amber',
  pdf: 'rose',
}

export function AppSidebar({ items, activeItemId, onNavigate }) {
  return (
    <nav className="app-sidebar" aria-label="Tool navigation">
      {items.map((item) => {
        const isActive = item.id === activeItemId
        return (
          <button
            key={item.id}
            type="button"
            className={`app-sidebar__item${isActive ? ' app-sidebar__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <AppIcon label={item.icon} color={colorMap[item.id] || 'sky'} active={isActive} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
