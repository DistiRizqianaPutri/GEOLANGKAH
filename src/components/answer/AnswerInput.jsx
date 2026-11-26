/**
 * Isian angka + pilihan satuan berupa tombol (DESIGN.md §3).
 * `inputmode="decimal"` memunculkan keyboard angka; koma dan titik diterima.
 */
export default function AnswerInput({ label, value, onValue, unit, onUnit, units, disabled = false }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex min-h-12 items-center gap-2 font-extrabold">
        <span>{label} =</span>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onValue(e.target.value)}
          disabled={disabled}
          aria-label={`Jawaban ${label}`}
          className="h-12 w-28 rounded-button border-2 border-surface-border bg-white px-3 text-body font-extrabold focus:border-heading focus:outline-none disabled:bg-surface"
        />
      </label>
      <div role="group" aria-label="Pilih satuan" className="flex gap-2">
        {units.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onUnit(u)}
            disabled={disabled}
            aria-pressed={unit === u}
            aria-label={`Satuan ${u}`}
            className="h-12 min-w-12 rounded-button border-2 border-surface-border bg-white px-3 font-extrabold aria-pressed:border-heading aria-pressed:bg-primary-from disabled:opacity-60"
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  )
}
