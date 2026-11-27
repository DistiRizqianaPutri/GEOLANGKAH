import { useState } from 'react'
import { askTutor, MAX_QUESTIONS, readTutorCount, tutorPayload, writeTutorCount } from '../../lib/tutor.js'

const storage = () => (typeof localStorage === 'undefined' ? null : localStorage)

/**
 * Tutor AI (F-16, RMT.md §7): muncul setelah petunjuk L2 dibuka. Tutor hanya bertanya,
 * maksimal 5 pertanyaan per soal. Bila API gagal, tampil petunjuk L2 biasa.
 */
export default function TutorPanel({ step, record }) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState(() => readTutorCount(storage(), step.id))
  const [reply, setReply] = useState(null)
  const [busy, setBusy] = useState(false)
  const left = MAX_QUESTIONS - asked

  const send = async () => {
    if (!question.trim() || busy || left <= 0) return
    setBusy(true)
    const res = await askTutor(tutorPayload(step, record, question, asked))
    const n = asked + 1
    writeTutorCount(storage(), step.id, n)
    setAsked(n)
    setReply(res.reply ?? `Tutor sedang tidak bisa dihubungi. Petunjuk 2: ${step.hints?.[1] ?? ''}`)
    setQuestion('')
    setBusy(false)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-12 rounded-button px-2 font-extrabold text-hint underline">
        Tanya Tutor
      </button>
    )
  }

  return (
    <section aria-label="Tutor" className="space-y-2 rounded-card border-2 border-hint bg-hint-bg p-3">
      <p className="font-extrabold text-hint">Tutor</p>
      {reply && <p aria-live="polite">{reply}</p>}
      {left > 0 ? (
        <>
          <label className="block">
            <span className="sr-only">Pertanyaanmu untuk tutor</span>
            <input
              type="text"
              value={question}
              maxLength={300}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Tulis pertanyaanmu"
              className="h-12 w-full rounded-button border-2 border-surface-border bg-white px-3 text-body focus:border-heading focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={send}
            disabled={busy || !question.trim()}
            className="min-h-12 rounded-button border-2 border-hint bg-white px-3 font-extrabold text-hint disabled:opacity-60"
          >
            {busy ? 'Menunggu tutor…' : 'Kirim'}
          </button>
          <p className="text-text-muted">Sisa {left} pertanyaan untuk soal ini.</p>
        </>
      ) : (
        <p className="text-text-muted">Batas tanya untuk soal ini sudah habis.</p>
      )}
    </section>
  )
}
