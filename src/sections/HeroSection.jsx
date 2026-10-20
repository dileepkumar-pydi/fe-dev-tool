import { ToolSearch } from '../components/ToolSearch'
import { APP_ROUTES, toHash } from '../utils/appRouter'

const shortcuts = [
  { id: 'json', label: 'Format JSON' },
  { id: 'base64', label: 'Encode Base64' },
  { id: 'uuid', label: 'Generate UUIDs' },
  { id: 'pdf', label: 'Work with PDFs' },
]

export function HeroSection() {
  return <section className="hero-section">
    <div className="container hero-section__inner">
      <p className="hero-kicker">YOUR EVERYDAY DEVELOPER TOOLKIT</p>
      <h1 className="hero-title">Format. Convert.<br /><span>Keep building.</span></h1>
      <p className="hero-description">Clean up JSON, encode text, generate hashes, and work with PDFs. Find your tool and get straight to the result.</p>
      <div className="hero-search"><ToolSearch className="search-box" placeholder="Find a tool — JSON, Base64, PDF…" /></div>
      <nav className="hero-shortcuts" aria-label="Quick access tools">
        {shortcuts.map((tool) => <a key={tool.id} href={toHash(APP_ROUTES[tool.id])}>{tool.label}<span aria-hidden="true">↗</span></a>)}
      </nav>
    </div>
  </section>
}
