/**
 * LeppinkItem (DESIGN.md §3, §4.7): pernyataan + 11 tombol 0–10 dalam 2 baris (0–5, 6–10).
 * Bukan slider. Tombol terpilih ditandai warna + tebal (tidak hanya warna).
 */
export default function LeppinkItem({ text, label0, label10, value, onChange }) {
  const button = (n) => {
    const selected = value === n
    return (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        aria-pressed={selected}
        className={`h-12 min-w-12 flex-1 rounded-button border-2 text-body font-extrabold ${selected ? 'border-heading bg-heading text-surface' : 'border-surface-border bg-surface text-heading'}`}
      >
        {n}
      </button>
    )
  }
  return (
    <section className="space-y-3">
      <p className="text-step-title font-extrabold text-heading">{text}</p>
      <div className="flex justify-between gap-2 text-base text-text-muted">
        <span>0 = {label0}</span>
        <span className="text-right">10 = {label10}</span>
      </div>
      <div className="flex gap-1.5">{[0, 1, 2, 3, 4, 5].map(button)}</div>
      <div className="flex gap-1.5">{[6, 7, 8, 9, 10].map(button)}</div>
    </section>
  )
}
