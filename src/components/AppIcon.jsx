export function AppIcon({ label, color = 'sky', active = false }) {
  const iconColorClass = `app-icon app-icon--${color}${active ? ' app-icon--active' : ''}`

  return <div className={iconColorClass} aria-hidden="true">
    {label === 'palette' ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1.6 1.6 0 0 1 1.2-2.7H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" />
        <circle cx="7.5" cy="10" r="1" />
        <circle cx="10.5" cy="7" r="1" />
        <circle cx="15" cy="7.5" r="1" />
        <circle cx="7" cy="14.5" r="1" />
      </svg>
    ) : ['code', 'key', 'regex', 'diff'].includes(label) ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {label === 'code' && <><path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18" /></>}
        {label === 'key' && <><circle cx="8" cy="9" r="5" /><path d="m12 13 8 8M16 17l3-3M19 20l3-3" /></>}
        {label === 'regex' && <><circle cx="5" cy="18" r="1" /><path d="M16 4v12M10 7l12 6M10 13l12-6" /></>}
        {label === 'diff' && <><path d="M3 6h8M7 2v8M15 6h6M3 14h18M3 20h18" /></>}
      </svg>
    ) : label}
  </div>
}
