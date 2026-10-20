import { AppIcon } from './AppIcon'
import { dashboardCategories } from '../data/appContent'
import { APP_ROUTES, toHash } from '../utils/appRouter'

const toolOrder = ['json', 'base64', 'pdf', 'web', 'jwt', 'regex', 'diff', 'hash', 'text', 'uuid', 'timestamp', 'number', 'escape', 'color', 'file']
const tools = toolOrder.map((id) => dashboardCategories.find((tool) => tool.id === id))

export function ToolDirectory() {
  return <div className="tool-directory">
    {tools.map((tool) => <a key={tool.id} className={`directory-card directory-card--${tool.id}`} href={toHash(APP_ROUTES[tool.id])}>
      <AppIcon label={tool.icon} color={tool.color} />
      <div className="directory-card__copy"><h3>{tool.title.replace(' Tools', '')}</h3><p>{tool.description}</p></div>
      <span className="directory-card__arrow" aria-hidden="true">↗</span>
    </a>)}
  </div>
}
