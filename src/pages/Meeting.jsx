import { Navigate, useParams } from 'react-router'
import StepEngine from '../components/step/StepEngine.jsx'
import useSession from '../components/ui/useSession.js'
import MEETINGS from '../content/meetings.js'
import stations from '../content/stations.json'
import { isMeetingDone } from '../lib/stepEngine.js'

// Menjalankan fase Kenali → Bangun → Latih → Tantangan satu pertemuan.
// Pretest (P1) dan Skala Leppink menyusul di M7.
export default function Meeting() {
  const n = Number(useParams().n)
  const { session } = useSession()
  const meeting = MEETINGS[n]
  const station = stations.find((s) => s.meeting === n)
  const unlocked = n === 1 || isMeetingDone(localStorage, session.code, n - 1)

  if (!meeting || !station || !unlocked) return <Navigate to="/peta" replace />
  return <StepEngine key={n} meeting={meeting} stationName={station.name} code={session.code} />
}
