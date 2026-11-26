import Icon from '../ui/Icon.jsx'

/**
 * Tabel dua kolom Diketahui / Ditanya (DESIGN.md §3, §4.5), terisi dari tanda siswa.
 * Baris Diketahui bisa dihapus (dikoreksi) selama tahap Rumuskan belum selesai.
 *
 * @param {{id:string, text:string}[]} known
 * @param {string[]} asked
 * @param {(id:string)=>void} [onRemove]  tidak ada = terkunci
 */
export default function KnownAskedTable({ known, asked, onRemove }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-card border border-surface-border bg-white p-3">
      <section aria-label="Diketahui">
        <h2 className="font-extrabold text-heading">Diketahui</h2>
        {known.length === 0 && <p className="text-text-muted">Belum ada</p>}
        <ul className="space-y-1">
          {known.map(({ id, text }) => (
            <li key={id} className="flex items-center gap-1">
              <span className="min-w-0 flex-1 break-words">{text}</span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(id)}
                  aria-label={`Hapus ${text} dari Diketahui`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button text-text-muted"
                >
                  <Icon name="close" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Ditanya" className="border-l border-surface-border pl-2">
        <h2 className="font-extrabold text-heading">Ditanya</h2>
        {asked.length === 0 && <p className="text-text-muted">Belum ada</p>}
        <ul className="space-y-1">
          {asked.map((text) => (
            <li key={text} className="break-words">
              {text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
