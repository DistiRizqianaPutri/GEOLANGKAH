import { useState } from 'react'
import {
  allChips,
  askedKey,
  askedText,
  knownChips,
  knownText,
  missingKnown,
  moveToKnown,
  rejectResult,
  storyComplete,
  storyResult,
} from '../../lib/story.js'
import FeedbackBanner from '../answer/FeedbackBanner.jsx'
import KnownAskedTable from '../story/KnownAskedTable.jsx'
import StoryReader from '../story/StoryReader.jsx'
import ChoiceQuestion from './ChoiceQuestion.jsx'
import StepCard from './StepCard.jsx'

/**
 * Tahap Rumuskan soal cerita (KONTEN §6): baca per potongan, tandai info penting,
 * pindahkan ke Diketahui, lalu jawab Ditanya (keliling atau luas?).
 * Lanjut terbuka setelah semua info penting ada di Diketahui dan semua Ditanya benar.
 * Chip pengecoh ditolak dengan umpan balik dan dicatat sebagai percobaan.
 */
export default function StoryStep({ step, records, onAttempt }) {
  const record = records[step.id]
  const done = record?.done === true
  const last = step.segments.length - 1
  const [page, setPage] = useState(done ? last : 0)
  const [selected, setSelected] = useState([])
  const [marked, setMarked] = useState(() => (done ? knownChips(step).map((c) => c.id) : []))
  const [rejected, setRejected] = useState(null)

  const chips = new Map(allChips(step).map((c) => [c.id, c]))
  const asked = step.asked ?? []

  const finishIfComplete = (nextMarked, nextRecords) => {
    if (!done && storyComplete(step, nextMarked, nextRecords)) onAttempt(storyResult(step, nextMarked))
  }

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((k) => k !== id) : [...s, id]))

  const move = () => {
    const r = moveToKnown(step, marked, selected)
    setMarked(r.marked)
    setSelected([])
    setRejected(r.rejected[0] ?? null)
    for (const chip of r.rejected) onAttempt(rejectResult(chip))
    finishIfComplete(r.marked, records)
  }

  const remove = (id) => setMarked((m) => m.filter((k) => k !== id))

  const answerAsked = (i, result) => {
    const key = askedKey(step, i)
    onAttempt(result, key)
    if (result.correct) finishIfComplete(marked, { ...records, [key]: { done: true } })
  }

  const knownRows = marked.map((id) => ({ id, text: knownText(chips.get(id).known) }))
  const askedRows = asked.filter((_, i) => records[askedKey(step, i)]?.done).map(askedText)
  const missing = missingKnown(step, marked).length
  const onLastPage = page === last

  return (
    <StepCard title={step.title} text={step.text} stage={step.stage}>
      <StoryReader
        segments={step.segments}
        page={page}
        onPage={(p) => {
          setPage(p)
          setRejected(null)
        }}
        selected={selected}
        marked={marked}
        onToggle={toggle}
        locked={done}
      />
      {!done && (
        <button
          type="button"
          onClick={move}
          disabled={selected.length === 0}
          className="min-h-12 w-full rounded-button border-2 border-heading bg-white px-4 font-extrabold text-heading disabled:opacity-50"
        >
          Pindahkan ke Diketahui
        </button>
      )}
      {rejected && <FeedbackBanner key={`${rejected.id}-${record?.attempts}`} correct={false} text={rejected.feedback} />}
      <KnownAskedTable known={knownRows} asked={askedRows} onRemove={done ? undefined : remove} />
      {(onLastPage || done) && (
        <>
          {asked.map((a, i) => (
            <ChoiceQuestion
              key={a.label}
              question={a.question}
              record={records[askedKey(step, i)]}
              onAttempt={(r) => answerAsked(i, r)}
            />
          ))}
          {!done && missing > 0 && (
            <p className="text-text-muted">Masih ada {missing} info penting yang belum ada di Diketahui.</p>
          )}
        </>
      )}
      {done && <FeedbackBanner correct text="Tepat! Diketahui dan Ditanya sudah lengkap." />}
    </StepCard>
  )
}
