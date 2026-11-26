import { canOpenHint } from '../../lib/hintRules.js'

const LEVEL_NAME = ['Petunjuk 1', 'Petunjuk 2', 'Petunjuk 3']

/**
 * Panel petunjuk 3 tingkat (KONTEN.md §7). Ada di alur halaman (tidak menutup gambar).
 * L2 setelah L1; L3 setelah L2 dan minimal 1 percobaan.
 */
export default function HintPanel({ hints, opened, attempts, onOpen, locked = false }) {
  const next = opened + 1
  const canNext = !locked && next <= hints.length && canOpenHint(next, { opened, attempts })
  return (
    <section aria-label="Petunjuk" className="rounded-card border-2 border-hint bg-hint-bg p-3">
      <ol className="space-y-2">
        {hints.slice(0, opened).map((h, i) => (
          <li key={i}>
            <p className="text-base font-extrabold text-hint">{LEVEL_NAME[i]}</p>
            <p>{h}</p>
          </li>
        ))}
      </ol>
      {canNext && (
        <button type="button" onClick={() => onOpen(next)} className="mt-1 min-h-12 font-extrabold text-hint underline">
          Petunjuk berikutnya
        </button>
      )}
      {!locked && !canNext && next === 3 && (
        <p className="mt-2 text-text-muted">Coba jawab dulu. Setelah itu petunjuk terakhir bisa dibuka.</p>
      )}
    </section>
  )
}
