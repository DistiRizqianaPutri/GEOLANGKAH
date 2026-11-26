import { useState } from 'react'
import Icon from '../ui/Icon.jsx'

/**
 * Hasil cek (DESIGN.md §3): ikon ✓/! + 1 kalimat spesifik.
 * `solution` (isi L3) bisa dibuka lewat "Lihat pembahasan"; `revealed` = langsung tampil.
 */
export default function FeedbackBanner({ correct, text, solution, revealed = false }) {
  const [open, setOpen] = useState(revealed)
  const tone = correct ? 'border-success text-success' : 'border-error text-error'
  return (
    <div role="status" className={`rounded-card border-2 bg-surface p-3 ${tone}`}>
      <p className="flex items-start gap-2 font-extrabold">
        <span className="mt-0.5 shrink-0">
          <Icon name={correct ? 'check' : 'alert'} />
        </span>
        <span>{text}</span>
      </p>
      {solution && !open && (
        <button type="button" onClick={() => setOpen(true)} className="mt-1 min-h-12 font-extrabold text-heading underline">
          Lihat pembahasan
        </button>
      )}
      {solution && open && <p className="mt-2 text-text">{solution}</p>}
    </div>
  )
}
