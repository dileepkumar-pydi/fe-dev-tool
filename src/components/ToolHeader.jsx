import { APP_ROUTES, toHash } from '../utils/appRouter'

export function ToolHeader({ category, title, description }) {
  return <header className="tool-header">
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href={toHash(APP_ROUTES.dashboard)}>All tools</a><span>›</span>
      <a href={toHash(`category/${category.split(' ')[0].toLowerCase()}`)}>{category.replace(' Tools', '')}</a>
    </nav>
    <h1 className="tool-header__title">{title}</h1>
    <p className="tool-header__description">{description}</p>
  </header>
}
