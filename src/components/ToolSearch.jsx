import { useState } from 'react'
import { sidebarItems, toolPages } from '../data/appContent'
import { APP_ROUTES, toHash } from '../utils/appRouter'
import { SearchIcon } from './SearchIcon'

export function ToolSearch({ className = 'app-topbar__search', placeholder = 'Search tools...' }) {
  const [query, setQuery] = useState('')
  const results = query.trim() ? sidebarItems.filter((item) => item.type === 'tool' &&
    `${item.label} ${toolPages[item.id]?.description}`.toLowerCase().includes(query.toLowerCase().trim())) : []
  return <form className={`tool-search ${className}`} role="search" onSubmit={(event) => {
    event.preventDefault()
    if (results[0]) { window.location.hash = toHash(APP_ROUTES[results[0].id]); setQuery('') }
  }}>
    <SearchIcon />
    <input aria-label="Search developer tools" value={query} onChange={(event) => setQuery(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Escape') setQuery('') }} placeholder={placeholder} />
    {query.trim() && <div className="tool-search__results">
      {results.length ? results.map((item) => <a key={item.id} href={toHash(APP_ROUTES[item.id])} onClick={() => setQuery('')}>
        <strong>{item.label}</strong><span>{toolPages[item.id].description}</span>
      </a>) : <p>No tools found. Try JSON, PDF, or Base64.</p>}
    </div>}
  </form>
}
