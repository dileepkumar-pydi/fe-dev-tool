import {
  dashboardCategories,
  dashboardStats,
  popularTools,
  quickStartGuide,
  recentActivity,
} from '../data/appContent'
import { MetricCard } from '../components/MetricCard'
import { SurfaceCard } from '../components/SurfaceCard'
import { ToolCategoryCard } from '../components/ToolCategoryCard'
import { Button } from '../components/Button'

export function DashboardPage({ onOpenTool }) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
        <p className="dashboard-page__subtitle">Welcome back! Select a tool category to get started.</p>
      </header>

      <div className="dashboard-stats">
        {dashboardStats.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-main">
          <h2 className="dashboard-section-title">Tool Categories</h2>
          <div className="dashboard-categories">
            {dashboardCategories.map((category) => (
              <ToolCategoryCard
                key={category.id}
                {...category}
                onClick={() => onOpenTool(category.id)}
                highlighted={category.id === 'hash'}
              />
            ))}
          </div>
        </section>

        <aside className="dashboard-side">
          <SurfaceCard title="Popular Tools">
            <div className="dashboard-panel-subtitle">Most used this week</div>
            <div className="rank-list">
              {popularTools.map((tool) => (
                <div key={tool.rank} className="rank-list__item">
                  <div className="rank-list__badge">{tool.rank}</div>
                  <div>
                    <div className="rank-list__title">{tool.name}</div>
                    <div className="rank-list__meta">{tool.uses}</div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard title="Recent Activity">
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div key={item.title} className="activity-list__item">
                  <span className="activity-list__dot" />
                  <div>
                    <div className="activity-list__title">{item.title}</div>
                    <div className="activity-list__time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard title={quickStartGuide.title} className="surface-card--soft">
            <div className="dashboard-panel-subtitle">{quickStartGuide.subtitle}</div>
            <p className="dashboard-panel-copy">{quickStartGuide.description}</p>
            <Button variant="secondary" className="button--full-width">
              {quickStartGuide.action}
            </Button>
          </SurfaceCard>
        </aside>
      </div>
    </div>
  )
}
