export function SectionHeading({ title, subtitle, largeTitle = false, wideSubtitle = false }) {
  return (
    <>
      <h2 className={`section-title ${largeTitle ? 'section-title--large' : ''}`.trim()}>{title}</h2>
      {subtitle ? (
        <p className={`section-subtitle ${wideSubtitle ? 'section-subtitle--wide' : ''}`.trim()}>{subtitle}</p>
      ) : null}
    </>
  )
}
