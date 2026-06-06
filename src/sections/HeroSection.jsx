import { Button } from '../components/Button'
import { SearchIcon } from '../components/SearchIcon'

export function HeroSection({ featuredTools }) {
  return (
    <section className="hero-section">
      <div className="container hero-section__inner">
        <div className="eyebrow-pill">100+ Developer Utilities</div>

        <h1 className="hero-title">
          Developer Utilities,
          <br />
          Simplified & Fast
        </h1>

        <p className="hero-description">
          Transform, convert, and process data with powerful API-driven tools. Built for developers who value speed and
          precision.
        </p>

        <div className="hero-search">
          <label className="search-box">
            <SearchIcon />
            <input type="text" placeholder="Search for a tool..." />
          </label>

          <Button className="button--hero" withArrow>
            Browse Tools
          </Button>
        </div>

        <div className="tool-chip-list">
          {featuredTools.map((tool) => (
            <span key={tool} className="tool-chip">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
