import { useState } from 'react'
import { sidebarItems, toolPages } from '../data/appContent'
import { APP_ROUTES, toHash } from '../utils/appRouter'
import { SearchIcon } from './SearchIcon'

export function ToolSearch({ className = 'app-topbar__search', placeholder = 'Search tools...' }) {
  const [query, setQuery] = useState('')
  const searchable = sidebarItems.filter((item) => item.type === 'tool').flatMap((item) => [
    { ...item, description: toolPages[item.id]?.description, route: APP_ROUTES[item.id] },
    ...(item.id === 'image' ? toolPages.image.operations.map((tool) => ({ id: `image-${tool.id}`, label: tool.label, description: tool.description, route: `${APP_ROUTES.image}/${tool.id}` })) : []),
  ])
  const results = query.trim() ? searchable.filter((item) =>
    `${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 8) : []
  return <form className={`tool-search ${className}`} role="search" onSubmit={(event) => {
    event.preventDefault()
    if (results[0]) { window.location.assign(toHash(results[0].route)); setQuery('') }
  }}>
    <SearchIcon />
    <input aria-label="Search developer tools" value={query} onChange={(event) => setQuery(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Escape') setQuery('') }} placeholder={placeholder} />
    {query.trim() && <div className="tool-search__results">
      {results.length ? results.map((item) => <a key={item.id} href={toHash(item.route)} onClick={() => setQuery('')}>
        <strong>{item.label}</strong><span>{item.description}</span>
      </a>) : <p>No tools found. Try JSON, PDF, or Base64.</p>}
    </div>}
  </form>
}
