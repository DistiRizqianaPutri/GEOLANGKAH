import { parseTemplate } from '../../lib/checkStep.js'

/** Rumus dengan kotak ▢ yang diisi siswa, mis. "L = 10 × ▢" (KONTEN.md §1, aturan memudar). */
export default function FadedTemplate({ template, blanks, onBlank, disabled = false }) {
  const parts = parseTemplate(template)
  const blankNo = (i) => parts.slice(0, i + 1).filter((p) => p.key).length
  return (
    <p className="flex flex-wrap items-center gap-x-1 gap-y-2 text-body font-extrabold">
      {parts.map((part, i) => {
        if (part.text) return <span key={i} className="whitespace-pre">{part.text}</span>
        return (
          <input
            key={i}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={blanks[part.key] ?? ''}
            onChange={(e) => onBlank(part.key, e.target.value)}
            disabled={disabled}
            aria-label={`Kotak kosong ${blankNo(i)}`}
            className="h-12 w-16 rounded-button border-2 border-dashed border-heading bg-white px-2 text-center font-extrabold focus:border-solid focus:outline-none disabled:border-solid disabled:bg-surface"
          />
        )
      })}
    </p>
  )
}
