import { dashboardCategories, toolPages } from '../data/appContent'
import { APP_ROUTES, toHash } from '../utils/appRouter'
import { AppIcon } from '../components/AppIcon'
import { Button } from '../components/Button'

export function CategoryPage({ id }) {
  const category = dashboardCategories.find((item) => item.id === id)
  const page = toolPages[id]
  if (!category || !page) return <NotFoundPage />
  return <div className="category-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href={toHash(APP_ROUTES.dashboard)}>All tools</a><span>›</span><span>{category.title}</span></nav>
    <header className="category-page__header"><AppIcon label={category.icon} color={category.color} /><div><h1>{category.title}</h1><p>{category.description}</p></div></header>
    <div className="category-page__grid">
      {(page.operations || [{ id, label: page.title, description: page.description }]).map((tool) =>
        <a className="category-tool" key={tool.id} href={toHash(page.operations ? `${APP_ROUTES[id]}/${tool.id}` : APP_ROUTES[id])}>
          <h2>{tool.label} <span>→</span></h2><p>{tool.description}</p>
        </a>)}
    </div>

  </div>
}

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Page not found</h1><p>The page you are looking for doesn’t exist.</p><div><Button href={toHash(APP_ROUTES.landing)}>Go Home</Button><Button variant="secondary" href={toHash(APP_ROUTES.dashboard)}>Open workspace</Button></div></div>
}
