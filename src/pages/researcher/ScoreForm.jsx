import { useState } from 'react'
import { sumStages } from '../../lib/instruments.js'

/**
 * Isian skor satu jawaban uraian: satu pilihan per tahap rubrik (0…maks tahap).
 * Skor butir = jumlah tahap; disimpan bila semua tahap terisi.
 */
export default function ScoreForm({ item, answer, answerKey, onSave }) {
  const [stages, setStages] = useState(() => item.stages.map((_, i) => answer.stage_scores?.[i] ?? null))
  const [state, setState] = useState({ busy: false, message: '' })
  const total = sumStages(stages, item.stages)

  const save = async () => {
    setState({ busy: true, message: '' })
    try {
      await onSave({ id: answer.id, stageScores: stages, score: total })
      setState({ busy: false, message: 'Tersimpan ✓' })
    } catch (err) {
      setState({ busy: false, message: `! ${err.message}` })
    }
  }

  return (
    <section className="space-y-2 rounded-card border border-surface-border bg-surface p-3">
      <p className="font-extrabold text-heading">
        Butir {item.number} — {item.title} <span className="font-normal text-text-muted">({item.competency})</span>
      </p>
      <p className="text-base text-text-muted">Jawaban siswa:</p>
      <p className="whitespace-pre-wrap rounded-button border border-surface-border p-2">{answer.answer || '(kosong)'}</p>
      <p className="text-base">
        <span className="font-extrabold">Kunci: </span>
        {answerKey ?? '(kunci belum termuat)'}
      </p>
      <div className="space-y-1">
        {item.stages.map((stage, i) => (
          <label key={stage.label} className="flex items-center justify-between gap-2">
            <span>
              {stage.label} <span className="text-text-muted">(maks {stage.max})</span>
            </span>
            <select
              value={stages[i] ?? ''}
              onChange={(e) => setStages(stages.map((v, j) => (j === i ? (e.target.value === '' ? null : Number(e.target.value)) : v)))}
              className="h-12 min-w-16 rounded-button border-2 border-surface-border bg-surface px-2"
            >
              <option value="">–</option>
              {Array.from({ length: stage.max + 1 }, (_, v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-extrabold">
          Skor: {total ?? '–'} / {item.max}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={total === null || state.busy}
          className="min-h-12 rounded-button bg-heading px-4 font-extrabold text-surface disabled:opacity-40"
        >
          Simpan skor
        </button>
      </div>
      {state.message && <p role="status">{state.message}</p>}
    </section>
  )
}
