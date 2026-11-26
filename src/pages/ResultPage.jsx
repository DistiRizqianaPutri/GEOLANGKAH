import { Navigate, useNavigate, useParams } from 'react-router'
import PrimaryButton from '../components/ui/PrimaryButton.jsx'
import useSession from '../components/ui/useSession.js'
import MEETINGS from '../content/meetings.js'
import { challengeSummary, flattenSteps, loadProgress } from '../lib/stepEngine.js'

// Hasil Pos (layar luar, DESIGN.md §4.6). Tanpa bintang, poin, atau peringkat (§2.5).
export default function ResultPage() {
  const n = Number(useParams().n)
  const navigate = useNavigate()
  const { session } = useSession()
  const meeting = MEETINGS[n]
  const progress = meeting ? loadProgress(localStorage, session.code, n) : null

  if (!meeting || !progress.finished) return <Navigate to="/peta" replace />

  const steps = flattenSteps(meeting, `${session.code}-m${n}`)
  const { correct, total, hintsUsed } = challengeSummary(steps, progress.records)

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-center text-step-title font-extrabold text-heading">Pos {n} selesai! 🎉</h1>
      <section className="space-y-1 rounded-card border border-surface-border bg-surface p-4">
        <p className="font-extrabold">
          Tantangan: {correct} dari {total} benar
        </p>
        <p>Petunjuk dipakai: {hintsUsed} kali</p>
      </section>
      <section className="rounded-card border border-surface-border bg-surface p-4">
        <p className="text-text-muted">Yang kamu temukan hari ini:</p>
        {meeting.summary.map((line) => (
          <p key={line} className="font-extrabold">
            {line}
          </p>
        ))}
      </section>
      <PrimaryButton onClick={() => navigate('/peta')}>Kembali ke Peta 🗺️</PrimaryButton>
    </main>
  )
}
