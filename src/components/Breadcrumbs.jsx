export function Breadcrumbs({ items }) {
  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="breadcrumbs__item">
          {item}
          {index < items.length - 1 ? <span className="breadcrumbs__sep">›</span> : null}
        </span>
      ))}
    </div>
  )
}
