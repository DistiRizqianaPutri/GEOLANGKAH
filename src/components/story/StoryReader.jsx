import { splitSegment } from '../../lib/story.js'
import Icon from '../ui/Icon.jsx'
import TextButton from '../ui/TextButton.jsx'

/**
 * Mode baca ringkas (F-08, DESIGN.md §4.5): satu potongan kalimat per halaman.
 * Angka/frasa di dalam kalimat berupa chip yang bisa diketuk untuk ditandai.
 * Halaman dipindah siswa sendiri (‹ Sebelumnya / Bagian berikutnya), tanpa timer.
 *
 * @param {object[]} segments  [{ text, chips }]
 * @param {number}   page
 * @param {(page:number)=>void} onPage
 * @param {string[]} selected  chip yang sedang ditandai (belum dipindah)
 * @param {string[]} marked    chip yang sudah ada di Diketahui
 * @param {(id:string)=>void} onToggle
 * @param {boolean}  locked    tahap Rumuskan selesai: chip tidak bisa diketuk
 */
export default function StoryReader({ segments, page, onPage, selected, marked, onToggle, locked = false }) {
  const segment = segments[page]
  const last = segments.length - 1
  return (
    <section aria-label="Soal cerita" className="space-y-2">
      <p className="font-extrabold text-text-muted">
        Bagian {page + 1} dari {segments.length}
      </p>
      <p className="rounded-card border border-surface-border bg-white p-3 leading-loose">
        {splitSegment(segment).map((part, i) => {
          if (part.text) return <span key={i}>{part.text}</span>
          const { id, text } = part.chip
          const isMarked = marked.includes(id)
          const isSelected = selected.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              disabled={locked || isMarked}
              aria-pressed={isSelected || isMarked}
              aria-label={isMarked ? `${text}, sudah di Diketahui` : `Tandai ${text}`}
              className="mx-0.5 inline-flex min-h-12 items-center rounded-button border-2 border-dashed border-heading bg-surface px-2 font-extrabold text-heading aria-pressed:border-solid aria-pressed:bg-primary-from/60 disabled:opacity-100"
            >
              {text}
            </button>
          )
        })}
      </p>
      <div className="flex flex-wrap justify-between gap-2">
        {page > 0 ? (
          <TextButton onClick={() => onPage(page - 1)}>
            <Icon name="back" />
            Sebelumnya
          </TextButton>
        ) : (
          <span />
        )}
        {page < last && (
          <TextButton onClick={() => onPage(page + 1)}>
            Bagian berikutnya
            <Icon name="next" />
          </TextButton>
        )}
      </div>
    </section>
  )
}
