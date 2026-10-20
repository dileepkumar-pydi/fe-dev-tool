import { ToolDirectory } from '../components/ToolDirectory'

export function DashboardPage() {
  return <div className="dashboard-page workspace-page">
    <header className="dashboard-page__header">
      <p className="hero-kicker">DEVTOOLS WORKSPACE</p>
      <h1 className="dashboard-page__title">What are you working on?</h1>
      <p className="dashboard-page__subtitle">Choose a tool to format, convert, generate, or inspect.</p>
    </header>
    <ToolDirectory />
  </div>
}
