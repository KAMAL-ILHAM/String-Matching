export default function Panel({ title, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-xl border border-mist bg-white shadow-sm p-4 sm:p-5 ${className}`}>
      {title && <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy">{title}</h2>}
      {children}
    </section>
  )
}
