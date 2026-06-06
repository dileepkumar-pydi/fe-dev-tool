const featuredTools = [
  'Base64 Encode/Decode',
  'JSON Formatter',
  'SHA-256 Hash Generator',
  'UUID Generator',
  'Timestamp Converter',
  'URL Encode/Decode',
  'HEX to RGB Converter',
  'File Hash Calculator',
]

const featureCards = [
  {
    title: 'Lightning Fast',
    description: 'Instant processing with optimized algorithms',
    icon: '⚡',
  },
  {
    title: 'Privacy First',
    description: 'All processing happens client-side',
    icon: '🔒',
  },
  {
    title: 'API Access',
    description: 'RESTful API for programmatic access',
    icon: '🌐',
  },
]

const categoryCards = [
  { title: 'Base64 Tools', count: '12 tools', icon: '</>' },
  { title: 'JSON Tools', count: '8 tools', icon: '{}' },
  { title: 'Hash Tools', count: '15 tools', icon: '#' },
  { title: 'Text Tools', count: '20 tools', icon: '📄' },
  { title: 'Timestamp Tools', count: '6 tools', icon: '◔' },
  { title: 'Number Tools', count: '10 tools', icon: '010' },
  { title: 'Escape Tools', count: '8 tools', icon: '🛡' },
  { title: 'Color Tools', count: '12 tools', icon: '🎨' },
]

const apiPreview = `{
  "status": {
    "code": 200,
    "message": "Success",
    "description": "Data processed successfully"
  },
  "data": {
    "result": "...",
    "metadata": {}
  }
}`

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 text-lg font-semibold text-white">
              {'</>'}
            </div>
            <span className="text-[2rem] font-semibold tracking-tight text-slate-900">DevTools</span>
          </a>

          <nav className="hidden items-center gap-10 md:flex">
            <a href="#categories" className="text-lg font-medium text-slate-800 transition hover:text-sky-500">
              Dashboard
            </a>
            <a
              href="#cta"
              className="rounded-xl bg-sky-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-sky-600"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-100 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.10),transparent_35%),linear-gradient(180deg,#f8fcff_0%,#f7fbff_100%)]">
          <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center lg:px-8 lg:pb-28 lg:pt-28">
            <div className="mx-auto inline-flex rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              100+ Developer Utilities
            </div>

            <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-slate-800 sm:text-6xl lg:text-7xl">
              Developer Utilities,
              <br />
              Simplified & Fast
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-500 sm:text-2xl">
              Transform, convert, and process data with powerful API-driven tools. Built for developers who value
              speed and precision.
            </p>

            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row">
              <label className="flex flex-1 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search for a tool..."
                  className="w-full bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <button className="inline-flex items-center justify-center gap-3 rounded-xl bg-sky-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-600">
                Browse Tools
                <ArrowIcon />
              </button>
            </div>

            <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3">
              {featuredTools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-base font-medium text-slate-700 shadow-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-500">
                  {card.icon}
                </div>
                <h2 className="mt-8 text-2xl font-semibold tracking-tight text-slate-800">{card.title}</h2>
                <p className="mt-4 text-xl leading-8 text-slate-500">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-6xl px-6 py-16 text-center lg:px-8 lg:py-24">
          <h2 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">Browse by Category</h2>
          <p className="mt-5 text-2xl text-slate-500">Organized tools for every development need</p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categoryCards.map((category) => (
              <article
                key={category.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-xl font-semibold text-sky-500">
                  {category.icon}
                </div>
                <h3 className="mt-7 text-2xl font-semibold tracking-tight text-slate-800">{category.title}</h3>
                <p className="mt-2 text-xl text-slate-500">{category.count}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-16">
          <div className="rounded-[2rem] bg-sky-50 px-8 py-14 text-center sm:px-12 lg:px-20 lg:py-16">
            <h2 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">API-First Workflow</h2>
            <p className="mx-auto mt-5 max-w-4xl text-2xl leading-9 text-slate-500">
              Every tool provides structured API responses with status codes, messages, and data payloads for seamless
              integration.
            </p>

            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl bg-slate-800 px-8 py-7 text-left shadow-xl">
              <pre className="overflow-x-auto text-[1.35rem] leading-10 text-slate-100">
                <code>{apiPreview}</code>
              </pre>
            </div>
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-6 py-20 text-center lg:px-8 lg:py-24">
          <h2 className="text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl">Ready to boost your workflow?</h2>
          <p className="mx-auto mt-6 max-w-3xl text-2xl leading-9 text-slate-500">
            Start using DevTools today. No signup required.
          </p>
          <a
            href="#categories"
            className="mt-10 inline-flex items-center gap-3 rounded-xl bg-sky-500 px-7 py-4 text-xl font-semibold text-white transition hover:bg-sky-600"
          >
            Launch Dashboard
            <ArrowIcon />
          </a>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-sm font-semibold text-white">
              {'</>'}
            </div>
            <span className="text-2xl font-semibold text-slate-800">DevTools</span>
          </div>
          <p className="text-lg">© 2026 DevTools. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export default App
