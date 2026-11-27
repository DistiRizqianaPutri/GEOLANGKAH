import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import PrimaryButton from '../components/ui/PrimaryButton.jsx'
import TextButton from '../components/ui/TextButton.jsx'
import TopBar from '../components/ui/TopBar.jsx'
import useInstrumentStatus from '../components/ui/useInstrumentStatus.js'
import useSession from '../components/ui/useSession.js'
import tests from '../content/tests.json'
import { clearDraft, loadDraft, markDone, saveDraft, testAnswerItems } from '../lib/instruments.js'
import { isMeetingDone } from '../lib/stepEngine.js'

const NAMES = { pre: 'Tes Awal', post: 'Tes Akhir' }

function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center p-4">
      <p className="text-text-muted">Memuat…</p>
    </main>
  )
}

/**
 * Pretest (/tes/pre, awal Pos 1) & posttest (/tes/post, setelah Pos 5) — PRD F-12.
 * Satu butir per layar, tanpa timer. Draf tersimpan di HP. Setelah dikirim terkunci.
 * Kunci jawaban TIDAK ada di aplikasi siswa (hanya lewat /api/export?key=1 untuk peneliti).
 */
export default function TestPage() {
  const { kind } = useParams()
  const { session } = useSession()
  const status = useInstrumentStatus()
  if (kind !== 'pre' && kind !== 'post') return <Navigate to="/peta" replace />
  // Posttest hanya setelah Pos 5 selesai.
  if (kind === 'post' && !isMeetingDone(localStorage, session.code, 5)) return <Navigate to="/peta" replace />
  if (!status) return <Loading />
  return <TestForm key={kind} kind={kind} done={status[kind]} />
}

function TestForm({ kind, done }) {
  const navigate = useNavigate()
  const { session, queue } = useSession()
  const { code, userId } = session
  const items = tests.items
  const total = items.length + 2 // petunjuk + butir + konfirmasi
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => loadDraft(localStorage, code, kind, {}))

  const after = kind === 'pre' ? '/pertemuan/1' : '/hasil/5'
  if (done) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
        <p className="text-center font-extrabold text-heading">{NAMES[kind]} sudah dikirim ✓</p>
        <PrimaryButton onClick={() => navigate(after, { replace: true })}>Lanjut</PrimaryButton>
      </main>
    )
  }

  const setAnswer = (id, value) => {
    const next = { ...answers, [id]: value }
    setAnswers(next)
    saveDraft(localStorage, code, kind, next)
  }

  const submit = () => {
    if (queue) {
      for (const item of testAnswerItems(kind, items, answers, userId)) queue.enqueue(item)
      queue.flush()
    }
    markDone(localStorage, code, kind)
    clearDraft(localStorage, code, kind)
    navigate(after, { replace: true })
  }

  const back = () => (index === 0 ? navigate('/peta') : setIndex(index - 1))
  const item = items[index - 1]
  const empty = items.filter((it) => !(answers[it.id] ?? '').trim()).length

  return (
    <>
      <TopBar title={NAMES[kind]} index={index} total={total} onBack={back} />
      <main className="mx-auto max-w-md space-y-4 p-4">
        {index === 0 && (
          <section className="space-y-2 rounded-card border border-surface-border bg-surface p-4">
            <h1 className="text-step-title font-extrabold text-heading">{NAMES[kind]}</h1>
            <p>{tests.instructions}</p>
            <p className="text-text-muted">Ada {items.length} soal. Tidak ada batas waktu.</p>
          </section>
        )}

        {item && (
          <section className="space-y-3">
            <p className="text-text-muted">
              Soal {item.number} dari {items.length}
            </p>
            <h1 className="text-step-title font-extrabold text-heading">{item.title}</h1>
            <p>{item.question}</p>
            <label className="block">
              <span className="mb-1 block font-extrabold">Jawabanmu</span>
              <textarea
                value={answers[item.id] ?? ''}
                onChange={(e) => setAnswer(item.id, e.target.value)}
                rows={8}
                className="w-full rounded-button border-2 border-surface-border bg-surface p-3 text-body focus:border-heading focus:outline-none"
              />
            </label>
          </section>
        )}

        {index === total - 1 && (
          <section className="space-y-2 rounded-card border border-surface-border bg-surface p-4">
            <h1 className="text-step-title font-extrabold text-heading">Kirim jawaban?</h1>
            <p>Setelah dikirim, jawaban tidak bisa diubah lagi.</p>
            {empty > 0 && <p className="font-extrabold text-hint">Masih ada {empty} soal yang kosong.</p>}
          </section>
        )}

        {index < total - 1 ? (
          <PrimaryButton onClick={() => setIndex(index + 1)}>Lanjut</PrimaryButton>
        ) : (
          <>
            <PrimaryButton onClick={submit}>Kirim jawaban</PrimaryButton>
            <TextButton onClick={() => setIndex(1)}>Periksa lagi</TextButton>
          </>
        )}
      </main>
    </>
  )
}
