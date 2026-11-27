import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import StepEngine from '../components/step/StepEngine.jsx'
import useSession from '../components/ui/useSession.js'
import MEETINGS from '../content/meetings.js'
import stations from '../content/stations.json'
import { fetchProgress, fetchStepLogs } from '../lib/remote.js'
import { flattenSteps, isFreshProgress, isMeetingDone, loadProgress, resumeFromServer, saveProgress } from '../lib/stepEngine.js'
import { supabase } from '../lib/supabase.js'

/**
 * Siapkan pertemuan n. Kunci berurutan: n = 1 atau n − 1 selesai (di HP ini atau di server).
 * HP baru (progres lokal kosong) → progres dibangun ulang dari step_logs + progress milik siswa.
 * Offline / gagal → memakai data HP saja.
 * @returns {Promise<'ok'|'locked'>}
 */
async function prepare(n, session) {
  const { code, userId } = session
  const localUnlocked = n === 1 || isMeetingDone(localStorage, code, n - 1)
  const fresh = isFreshProgress(loadProgress(localStorage, code, n))
  if ((localUnlocked && !fresh) || !supabase || !navigator.onLine) return localUnlocked ? 'ok' : 'locked'

  try {
    const server = await fetchProgress(supabase, userId)
    if (!localUnlocked && !server[n - 1]?.completed_at) return 'locked'
    if (fresh && server[n]) {
      const steps = flattenSteps(MEETINGS[n], `${code}-m${n}`)
      const logs = await fetchStepLogs(supabase, userId, n)
      saveProgress(localStorage, code, n, resumeFromServer(steps, logs, server[n]))
    }
    return 'ok'
  } catch {
    return localUnlocked ? 'ok' : 'locked'
  }
}

// Menjalankan fase Kenali → Bangun → Latih → Tantangan satu pertemuan.
// Pretest (P1) dan Skala Leppink menyusul di M7.
export default function Meeting() {
  const n = Number(useParams().n)
  const { session } = useSession()
  const meeting = MEETINGS[n]
  const station = stations.find((s) => s.meeting === n)
  const [status, setStatus] = useState({ n: null, value: 'loading' })

  useEffect(() => {
    if (!meeting) return
    let alive = true
    prepare(n, session).then((value) => alive && setStatus({ n, value }))
    return () => {
      alive = false
    }
  }, [n, meeting, session])

  if (!meeting || !station) return <Navigate to="/peta" replace />
  if (status.n !== n) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center p-4">
        <p className="text-text-muted">Memuat…</p>
      </main>
    )
  }
  if (status.value === 'locked') return <Navigate to="/peta" replace />
  return <StepEngine key={n} meeting={meeting} stationName={station.name} code={session.code} userId={session.userId} />
}
