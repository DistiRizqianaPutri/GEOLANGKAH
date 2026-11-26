import formulas from '../../content/formulas.json'
import Icon from '../ui/Icon.jsx'

/** Kartu lipat "Ingat rumus" (F-06): hanya rumus yang sudah dipelajari sampai pertemuan ini. */
export default function FormulaCard({ meeting }) {
  const list = formulas.filter((f) => f.fromMeeting <= meeting)
  return (
    <details className="rounded-card border border-surface-border bg-surface px-3">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 font-extrabold text-heading">
        <Icon name="book" />
        Ingat rumus
      </summary>
      <dl className="space-y-1 pb-3">
        {list.map((f) => (
          <div key={f.name}>
            <dt className="text-text-muted">{f.name}</dt>
            <dd className="font-extrabold">{f.formula}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
