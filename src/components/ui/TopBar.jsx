import Icon from './Icon.jsx'
import useSession from './useSession.js'

/** Teks status antrian log (ARSITEKTUR §6.4). */
function syncText({ pending, lastError }) {
  if (pending === 0) return 'Tersimpan ✓'
  return lastError || !navigator.onLine ? 'Menunggu sinyal…' : 'Menyimpan…'
}

/**
 * TopBar (DESIGN.md §3): tombol kembali, nama pos, indikator langkah.
 * Titik bila langkah ≤ 10, selain itu teks "3 / 12" agar muat di 360 px.
 * M6: di bawah nama pos ada status simpan kecil ("Tersimpan ✓ / Menunggu sinyal…").
 */
export default function TopBar({ title, index, total, onBack }) {
  const { queue, sync } = useSession()
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-surface-border bg-surface px-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali"
        className="flex size-12 shrink-0 items-center justify-center text-heading"
      >
        <Icon name="back" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-extrabold text-heading">{title}</p>
        {queue && (
          <p className="truncate text-base leading-tight text-text-muted" role="status">
            {syncText(sync)}
          </p>
        )}
      </div>
      <p className="shrink-0 pr-2 text-text-muted" aria-label={`Langkah ${index + 1} dari ${total}`}>
        {total > 10 ? (
          `${index + 1} / ${total}`
        ) : (
          <span className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`size-2.5 rounded-full ${i <= index ? 'bg-heading' : 'border-2 border-text-muted'}`} />
            ))}
          </span>
        )}
      </p>
    </header>
  )
}
